import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOnboardingSnapshot } from "@/lib/onboarding/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authState = await auth().catch(() => ({ userId: null }));
  const userId = authState.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const snapshot = await getOnboardingSnapshot(userId);
  return NextResponse.json(snapshot);
}
