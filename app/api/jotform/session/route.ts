import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildSigningPacket } from "@/lib/jotform";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { createSecureToken, hashToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const authState = await auth().catch(() => ({ userId: process.env.NODE_ENV === "development" ? "local-preview-user" : null }));
  const userId = authState.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser().catch(() => null);
  const supabase = getSupabaseAdmin();
  const token = createSecureToken();

  if (supabase) {
    const { data } = await supabase.from("verification_status").select("status").eq("clerk_user_id", userId).maybeSingle();
    if (data?.status && data.status !== "verified") {
      return NextResponse.json({ error: "Identity verification must be completed before signing." }, { status: 409 });
    }

    await supabase.from("onboarding_status").upsert({
      clerk_user_id: userId,
      current_step: "documents",
      updated_at: new Date().toISOString(),
    });
  }

  await recordAuditLog({
    clerkUserId: userId,
    action: "documents.session.created",
    metadata: { tokenHash: hashToken(token) },
  });

  const packet = buildSigningPacket({
    token,
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? null,
  });

  return NextResponse.json(packet);
}
