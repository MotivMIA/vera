import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { getClerkProfile } from "@/lib/onboarding/guards";
import { hasConsentAccepted, recordConsentAccepted } from "@/lib/onboarding/status";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authState = await auth().catch(() => ({ userId: null }));
  const userId = authState.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`onboarding:consent:${userId}:${ip ?? "unknown"}`, 10, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }

  if (await hasConsentAccepted(userId)) {
    return NextResponse.json({ ok: true, alreadyAccepted: true });
  }

  const profile = await getClerkProfile();
  await recordConsentAccepted(userId, profile);

  await recordAuditLog({
    clerkUserId: userId,
    action: "consent.accepted",
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const authState = await auth().catch(() => ({ userId: null }));
  const userId = authState.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await currentUser();
  const accepted = await hasConsentAccepted(userId);

  return NextResponse.json({
    accepted,
    email: user?.emailAddresses[0]?.emailAddress ?? null,
  });
}
