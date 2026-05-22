import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createDiditSession, getMissingDiditEnvKeys } from "@/lib/didit";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { rateLimit } from "@/lib/rate-limit";
import { createSecureToken, getClientIp, hashToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { hasConsentAccepted } from "@/lib/onboarding/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authState = await auth().catch(() => ({ userId: null }));
  const userId = authState.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized. Sign in and try again." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`didit:start:${userId}:${ip ?? "unknown"}`, 5, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }

  if (!(await hasConsentAccepted(userId))) {
    return NextResponse.json(
      { error: "Complete consent and disclosures before starting verification." },
      { status: 403 },
    );
  }

  const missingDiditVars = getMissingDiditEnvKeys();
  if (missingDiditVars.length > 0) {
    return NextResponse.json(
      { error: `DIDIT is not configured on the server. Missing: ${missingDiditVars.join(", ")}.` },
      { status: 500 },
    );
  }

  const siteUrl = getSiteUrl(request.nextUrl.origin);
  let diditSession;
  try {
    diditSession = await createDiditSession({
      userId,
      callbackUrl: `${siteUrl}/verify-identity`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start DIDIT verification." },
      { status: 502 },
    );
  }

  const token = createSecureToken();
  const sessionId = diditSession.sessionId;
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from("onboarding_status").upsert({
      clerk_user_id: userId,
      current_step: "identity",
      updated_at: new Date().toISOString(),
    });

    await supabase.from("verification_status").upsert({
      clerk_user_id: userId,
      provider: "didit",
      provider_session_id: sessionId,
      status: "pending",
      metadata_encrypted: diditSession.metadata,
      updated_at: new Date().toISOString(),
    });
  }

  await recordAuditLog({
    clerkUserId: userId,
    action: "verification.started",
    ip,
    userAgent: request.headers.get("user-agent"),
    metadata: { sessionId, secureTokenHash: hashToken(token) },
  });

  const verifyUrl = new URL("/verify-identity", siteUrl);
  verifyUrl.searchParams.set("session", sessionId);
  verifyUrl.searchParams.set("token", token);
  if (diditSession.embedUrl) {
    verifyUrl.searchParams.set("diditUrl", diditSession.embedUrl);
  }

  return NextResponse.json({
    sessionId,
    verificationUrl: verifyUrl.toString(),
    diditUrl: diditSession.embedUrl,
    diditSessionToken: diditSession.sessionToken,
    live: diditSession.live,
    status: "pending",
  });
}
