import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { syncClerkUserFromWebhookEvent } from "@/lib/onboarding/clerk-webhook-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await syncClerkUserFromWebhookEvent(event);
  return NextResponse.json({ received: true });
}
