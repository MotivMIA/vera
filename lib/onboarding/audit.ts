import type { AuditAction } from "@/types/onboarding";
import { encryptMetadata, hashIp } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type AuditInput = {
  clerkUserId?: string | null;
  action: AuditAction;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
};

export async function recordAuditLog(input: AuditInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    clerk_user_id: input.clerkUserId ?? null,
    action: input.action,
    ip_hash: hashIp(input.ip ?? null),
    user_agent: input.userAgent ?? null,
    metadata_encrypted: encryptMetadata(input.metadata),
  });
}
