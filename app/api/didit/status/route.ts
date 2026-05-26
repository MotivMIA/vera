import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { decryptMetadata } from "@/lib/security";
import { retrieveDiditSession, sanitizeDiditProviderStatus } from "@/lib/didit";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DiditSessionMetadata } from "@/types/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  const requestedSessionId = request.nextUrl.searchParams.get("sessionId");
  if (!userId && !requestedSessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (!requestedSessionId) {
      return NextResponse.json({ status: "pending", source: "mock" });
    }

    const liveSession = await retrieveDiditSession(requestedSessionId);
    if (!liveSession) {
      return NextResponse.json({ status: "pending", source: "mock" });
    }

    return NextResponse.json({
      status: liveSession.appStatus,
      providerStatus: liveSession.providerStatus,
      provider_session_id: liveSession.sessionId,
      embedUrl: liveSession.embedUrl,
      source: "live",
    });
  }

  const { data, error } = await supabase
    .from("verification_status")
    .select("status,provider_session_id,last_checked_at,updated_at,metadata_encrypted")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Unable to load verification status." }, { status: 500 });
  const sessionId = data?.provider_session_id ?? requestedSessionId;
  const liveSession = sessionId ? await retrieveDiditSession(sessionId) : null;

  if (liveSession && data?.provider_session_id) {
    await supabase
      .from("verification_status")
      .update({
        status: liveSession.appStatus,
        metadata_encrypted: liveSession.metadata,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "didit")
      .eq("provider_session_id", liveSession.sessionId);
  }

  const metadata = decryptMetadata<DiditSessionMetadata>(data?.metadata_encrypted ?? null);
  return NextResponse.json({
    status: liveSession?.appStatus ?? data?.status ?? "pending",
    providerStatus: liveSession?.providerStatus ?? metadata?.rawStatus ?? sanitizeDiditProviderStatus(null),
    provider_session_id: liveSession?.sessionId ?? data?.provider_session_id ?? requestedSessionId,
    last_checked_at: data?.last_checked_at ?? null,
    updated_at: data?.updated_at ?? null,
    embedUrl: liveSession?.embedUrl ?? metadata?.embedUrl ?? null,
    sessionToken: metadata?.sessionToken ?? null,
    source: liveSession ? "live" : metadata?.mode ?? "db",
  });
}
