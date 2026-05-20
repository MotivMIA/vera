import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDiditSession } from "@/lib/didit";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { rateLimit } from "@/lib/rate-limit";
import { createSecureToken, getClientIp, hashToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const startSchema = z.object({
  // Consent capture will ultimately live in the Clerk signup experience.
  // For now, allow the client to omit this field (but never allow false).
  consentsAccepted: z.literal(true).optional(),
});

export async function POST(request: NextRequest) {
  const authState = await auth().catch(() => ({ userId: process.env.NODE_ENV === "development" ? "local-preview-user" : null }));
  const userId = authState.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(request);
  const limited = rateLimit(`didit:start:${userId}:${ip ?? "unknown"}`, 5, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });

  const body = startSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Required consents must be accepted." }, { status: 400 });

  const token = createSecureToken();
  const siteUrl = request.nextUrl.origin || getSiteUrl();
  const diditSession = await createDiditSession({
    userId,
    callbackUrl: `${siteUrl}/verify-identity`,
  });
  const sessionId = diditSession.sessionId;
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from("onboarding_status").upsert({
      clerk_user_id: userId,
      current_step: "identity",
      terms_accepted_at: new Date().toISOString(),
      privacy_accepted_at: new Date().toISOString(),
      esign_accepted_at: new Date().toISOString(),
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

  const verificationUrl = verifyUrl.toString();

  return NextResponse.json({
    sessionId,
    verificationUrl,
    diditUrl: diditSession.embedUrl,
    diditSessionToken: diditSession.sessionToken,
    live: diditSession.live,
    status: "pending",
  });
}
