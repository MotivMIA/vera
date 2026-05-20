import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mapDiditStatus, serializeDiditMetadata, verifyDiditWebhook } from "@/lib/didit";
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
  if (
    !verifyDiditWebhook(rawBody, parsedBody as Record<string, unknown>, request.headers, [
      env.DIDIT_WEBHOOK_SECRET ?? "",
      env.DIDIT_WEBHOOK_SECRET_PREVIOUS ?? "",
    ])
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
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
