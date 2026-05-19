"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, ExternalLink, LoaderCircle, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VerificationState } from "@/types/onboarding";

type VerificationStatusResponse = {
  status: VerificationState;
  providerStatus?: string | null;
  provider_session_id?: string | null;
  embedUrl?: string | null;
  sessionToken?: string | null;
  source?: string;
};

type DiditSdkInitPayload = {
  sessionId: string;
  sessionToken?: string | null;
  container: HTMLElement;
  onStatus: (next: string) => void;
  onComplete: () => void;
};

declare global {
  interface Window {
    DiditSDK?: {
      init?: (payload: Record<string, unknown>) => unknown;
    };
    Didit?: {
      init?: (payload: Record<string, unknown>) => unknown;
      mount?: (payload: Record<string, unknown>) => unknown;
    };
  }
}

const DEFAULT_DIDIT_SDK_SRC = "https://verify.didit.me/sdk.js";

function normalizeStatus(status: string | null | undefined): VerificationState {
  if (status === "Approved") return "verified";
  if (status === "Declined" || status === "Expired" || status === "Kyc Expired" || status === "Abandoned") return "failed";
  return "pending";
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-didit-sdk="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load DIDIT SDK.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.diditSdk = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error("Failed to load DIDIT SDK.")));
    document.head.appendChild(script);
  });
}

function tryInitDiditSdk(payload: DiditSdkInitPayload) {
  const sdkPayload = {
    sessionId: payload.sessionId,
    sessionToken: payload.sessionToken ?? undefined,
    container: payload.container,
    element: payload.container,
    target: payload.container,
    onEvent: (event: { status?: string }) => {
      if (event?.status) payload.onStatus(event.status);
    },
    onStatusChange: (nextStatus: string) => payload.onStatus(nextStatus),
    onComplete: payload.onComplete,
  };

  const diditSdkInit = window.DiditSDK?.init;
  if (typeof diditSdkInit === "function") {
    diditSdkInit(sdkPayload);
    return true;
  }

  const diditInit = window.Didit?.init;
  if (typeof diditInit === "function") {
    diditInit(sdkPayload);
    return true;
  }

  const diditMount = window.Didit?.mount;
  if (typeof diditMount === "function") {
    diditMount(sdkPayload);
    return true;
  }

  return false;
}

export function DiditEmbed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackSessionId = searchParams?.get("verificationSessionId") ?? "";
  const callbackStatus = searchParams?.get("status") ?? "";
  const initialSessionId = searchParams?.get("session") ?? callbackSessionId;
  const initialEmbedUrl = searchParams?.get("diditUrl") ?? null;
  const diditSdkUrl = process.env.NEXT_PUBLIC_DIDIT_SDK_URL ?? DEFAULT_DIDIT_SDK_SRC;

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [embedUrl, setEmbedUrl] = useState<string | null>(initialEmbedUrl);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationState>(normalizeStatus(callbackStatus));
  const [providerStatus, setProviderStatus] = useState<string>(callbackStatus || "Pending");
  const [loading, setLoading] = useState(initialSessionId.length > 0);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(initialSessionId.length === 0);
  const [mode, setMode] = useState<"sdk" | "iframe">("sdk");
  const [redirecting, setRedirecting] = useState(false);

  const startDiditSession = useCallback(async () => {
    if (sessionId) {
      return;
    }

    setStarting(true);

    try {
      const response = await fetch("/api/didit/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consentsAccepted: true }),
      });

      const data = (await response.json()) as {
        sessionId?: string;
        diditUrl?: string | null;
        diditSessionToken?: string | null;
        verificationUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error ?? "Unable to start DIDIT verification.");
      }

      setSessionId(data.sessionId);
      setEmbedUrl(data.diditUrl ?? null);
      setSessionToken(data.diditSessionToken ?? null);
      setStatus("pending");
      setProviderStatus("Not Started");

      const params = new URLSearchParams();
      params.set("session", data.sessionId);
      if (data.diditUrl) {
        params.set("diditUrl", data.diditUrl);
      }
      router.replace(`/verify-identity?${params.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start DIDIT.");
      setStatus("failed");
      setProviderStatus("Failed to start");
    } finally {
      setStarting(false);
    }
  }, [router, sessionId]);

  const refreshStatus = useCallback(async (isBackground = false) => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    if (!isBackground) {
      setRefreshing(true);
    }

    try {
      const response = await fetch(`/api/didit/status?sessionId=${encodeURIComponent(sessionId)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as VerificationStatusResponse;
      if (!response.ok) {
        throw new Error("Unable to load DIDIT session.");
      }

      setStatus(data.status ?? "pending");
      setProviderStatus(data.providerStatus ?? "Pending");
      setEmbedUrl((current) => data.embedUrl ?? current ?? null);
      setSessionToken((current) => data.sessionToken ?? current ?? null);
    } catch {
      setStatus("pending");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (callbackStatus === "Approved") {
      setStatus("verified");
      setProviderStatus("Approved");
    }

    if (callbackStatus === "Declined") {
      setStatus("failed");
      setProviderStatus("Declined");
    }
  }, [callbackStatus]);

  useEffect(() => {
    if (!sessionId || status === "verified" || status === "failed") return;

    let active = true;
    const mountSdk = async () => {
      const container = document.getElementById("didit-sdk-root");
      if (!container) return;
      container.replaceChildren();

      try {
        await loadScript(diditSdkUrl);
        if (!active) return;

        const mounted = tryInitDiditSdk({
          sessionId,
          sessionToken,
          container,
          onStatus: (next) => {
            setProviderStatus(next);
            setStatus(normalizeStatus(next));
          },
          onComplete: () => {
            setStatus("verified");
            setProviderStatus("Approved");
          },
        });

        if (mounted) {
          setMode("sdk");
          return;
        }

        setMode("iframe");
      } catch {
        setMode("iframe");
      }
    };

    void mountSdk();
    return () => {
      active = false;
    };
  }, [diditSdkUrl, sessionId, sessionToken, status]);

  useEffect(() => {
    if (!sessionId) {
      void startDiditSession();
      return;
    }

    if (status === "verified") {
      setLoading(false);
      return;
    }

    void refreshStatus();

    const timer = window.setInterval(() => {
      void refreshStatus(true);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [refreshStatus, sessionId, startDiditSession, status]);

  useEffect(() => {
    if (status !== "verified") return;
    setRedirecting(true);

    const timer = window.setTimeout(() => {
      router.push("/documents");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [router, status]);

  const badge = (() => {
    switch (status) {
      case "verified":
        return (
          <Badge className="w-fit gap-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="size-3" />
            Verified
          </Badge>
        );
      case "failed":
        return (
          <Badge className="w-fit gap-2 border-destructive/20 bg-destructive/10 text-red-300">
            <XCircle className="size-3" />
            Needs attention
          </Badge>
        );
      default:
        return (
          <Badge className="w-fit gap-2">
            <LoaderCircle className="size-3 animate-spin" />
            Verification in progress
          </Badge>
        );
    }
  })();

  return (
    <Card className="glass-panel rounded-2xl">
      <CardHeader className="space-y-4">
        {badge}
        <div>
          <CardTitle>Embedded DIDIT verification</CardTitle>
          <CardDescription>
            Verification stays inside Visual Era. DIDIT still handles document capture, camera access, and verification decisions.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["No raw ID storage", ShieldCheck],
            [`Provider status: ${providerStatus}`, AlertCircle],
            [status === "verified" ? "Ready for documents" : "Awaiting DIDIT approval", ArrowRight],
          ].map(([label, Icon]) => {
            const TypedIcon = Icon as typeof ShieldCheck;
            return (
              <div key={label as string} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <TypedIcon className="mb-3 size-5 text-accent" />
                <p className="text-sm font-medium">{label as string}</p>
              </div>
            );
          })}
        </div>

          {status === "verified" ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck className="size-5" />
                </span>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Identity verification complete</p>
                  <p className="text-sm leading-6 text-muted-foreground">{redirecting ? "Verification complete. Redirecting you to documents..." : "DIDIT has completed the identity step."}</p>
                </div>
              </div>
            </div>
          ) : starting ? (
            <div className="flex min-h-[760px] items-center justify-center rounded-2xl border border-white/10 bg-black/20">
            <div className="text-center">
              <LoaderCircle className="mx-auto size-7 animate-spin text-accent" />
              <p className="mt-4 text-sm text-muted-foreground">Starting your DIDIT verification session…</p>
            </div>
          </div>
          ) : mode === "sdk" ? (
            <div id="didit-sdk-root" className="min-h-[760px] overflow-hidden rounded-2xl border border-white/10 bg-black/20" />
          ) : embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <iframe title="DIDIT identity verification" src={embedUrl} className="min-h-[760px] w-full bg-black" allow="camera; microphone; fullscreen; autoplay; encrypted-media" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-6 text-muted-foreground">
              DIDIT is not configured in this environment yet. Add `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, and `DIDIT_WEBHOOK_SECRET` to load the embedded verification flow.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => void refreshStatus()} disabled={refreshing}>
            {refreshing ? <LoaderCircle className="animate-spin" /> : <RefreshCcw />}
            Refresh status
          </Button>

          {embedUrl && status !== "verified" ? (
            <Button variant="outline" asChild>
              <a href={embedUrl} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open DIDIT in a new tab
              </a>
            </Button>
          ) : null}

            {status === "verified" ? (
              <Button asChild className="sm:ml-auto">
                <Link href="/documents">
                  Continue to documents
                  <ArrowRight className="ml-auto size-4" />
                </Link>
              </Button>
            ) : null}
          </div>

        {loading ? <p className="text-sm text-muted-foreground">Checking DIDIT session status…</p> : null}
      </CardContent>
    </Card>
  );
}
