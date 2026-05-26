import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchDiditWebhookSecrets, getDiditWebhookDebug, mapDiditStatus, serializeDiditMetadata, verifyDiditWebhook } from "@/lib/didit";
import { getServerEnv } from "@/lib/env";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const diditWebhookSchema = z.object({
  session_id: z.string(),
  vendor_data: z.string().optional(),
  status: z.string(),
  webhook_type: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  decision: z.unknown().optional(),
  timestamp: z.union([z.number(), z.string()]).optional(),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const env = getServerEnv();
  const parsedBody = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();
  const payload = diditWebhookSchema.safeParse(parsedBody);
  if (!payload.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const webhookSecrets = [env.DIDIT_WEBHOOK_SECRET ?? "", env.DIDIT_WEBHOOK_SECRET_PREVIOUS ?? ""];
  let validSignature = verifyDiditWebhook(rawBody, parsedBody as Record<string, unknown>, request.headers, webhookSecrets);
  if (!validSignature) {
    const remoteSecrets = await fetchDiditWebhookSecrets();
    if (remoteSecrets.length > 0) {
      validSignature = verifyDiditWebhook(rawBody, parsedBody as Record<string, unknown>, request.headers, remoteSecrets);
    }
  }
  if (!validSignature) {
    if (env.DIDIT_WEBHOOK_DEBUG) {
      console.error(
        "[didit.webhook] signature verification failed",
        getDiditWebhookDebug(rawBody, parsedBody as Record<string, unknown>, request.headers, webhookSecrets),
      );
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing } = await supabase
      .from("verification_status")
      .select("clerk_user_id")
      .eq("provider", "didit")
      .eq("provider_session_id", payload.data.session_id)
      .maybeSingle();

    if (
      existing?.clerk_user_id &&
      payload.data.vendor_data &&
      existing.clerk_user_id !== payload.data.vendor_data
    ) {
      return NextResponse.json({ error: "Session owner mismatch" }, { status: 403 });
    }

    await supabase
      .from("verification_status")
      .update({
        status: mapDiditStatus(payload.data.status),
        metadata_encrypted: serializeDiditMetadata({
          rawStatus: payload.data.status,
          webhookType: payload.data.webhook_type,
          decision: payload.data.decision,
          mode: "live",
        }),
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "didit")
      .eq("provider_session_id", payload.data.session_id);
  }

  await recordAuditLog({
    clerkUserId: payload.data.vendor_data ?? null,
    action: "verification.webhook.received",
    userAgent: request.headers.get("user-agent"),
    metadata: {
      sessionId: payload.data.session_id,
      status: payload.data.status,
      webhookType: payload.data.webhook_type,
    },
  });

  return NextResponse.json({ received: true });
}
