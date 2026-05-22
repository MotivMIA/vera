"use client";

import { useAuth } from "@clerk/nextjs";
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

const DIDIT_ORIGIN = "https://verify.didit.me";

function normalizeStatus(status: string | null | undefined): VerificationState {
  if (status === "Approved") return "verified";
  if (status === "Declined" || status === "Expired" || status === "Kyc Expired" || status === "Abandoned") return "failed";
  return "pending";
}

export function DiditEmbed() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const searchParams = useSearchParams();
  const callbackSessionId = searchParams?.get("verificationSessionId") ?? "";
  const callbackStatus = searchParams?.get("status") ?? "";
  const initialSessionId = searchParams?.get("session") ?? callbackSessionId;
  const initialEmbedUrl = searchParams?.get("diditUrl") ?? null;

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [embedUrl, setEmbedUrl] = useState<string | null>(initialEmbedUrl);
  const [status, setStatus] = useState<VerificationState>(normalizeStatus(callbackStatus));
  const [providerStatus, setProviderStatus] = useState<string>(callbackStatus || "Pending");
  const [loading, setLoading] = useState(initialSessionId.length > 0);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const startDiditSession = useCallback(
    async (attempt = 0) => {
      if (sessionId) return;

      if (!isLoaded) return;

      if (!isSignedIn || !userId) {
        const redirect = encodeURIComponent("/verify-identity");
        router.replace(`/sign-in?redirect_url=${redirect}`);
        return;
      }

      setStarting(true);
      setStartError(null);

      try {
        const response = await fetch("/api/didit/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ consentsAccepted: true }),
        });

        if (response.status === 401 && attempt < 3) {
          await wait(500);
          await startDiditSession(attempt + 1);
          return;
        }

        const data = (await response.json()) as {
          sessionId?: string;
          diditUrl?: string | null;
          error?: string;
        };

        if (!response.ok || !data.sessionId) {
          throw new Error(data.error ?? "Unable to start DIDIT verification.");
        }

        if (!data.diditUrl) {
          throw new Error("DIDIT did not return a verification URL. Check API keys and workflow on Vercel.");
        }

        setSessionId(data.sessionId);
        setEmbedUrl(data.diditUrl);
        setStatus("pending");
        setProviderStatus("Not Started");

        const params = new URLSearchParams();
        params.set("session", data.sessionId);
        params.set("diditUrl", data.diditUrl);
        router.replace(`/verify-identity?${params.toString()}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to start DIDIT.";
        setStartError(message);
        toast.error(message);
        setStatus("failed");
        setProviderStatus("Failed to start");
      } finally {
        setStarting(false);
      }
    },
    [isLoaded, isSignedIn, router, sessionId, userId],
  );

  const refreshStatus = useCallback(
    async (isBackground = false) => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      if (!isBackground) setRefreshing(true);

      try {
        const response = await fetch(`/api/didit/status?sessionId=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as VerificationStatusResponse & { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load DIDIT session.");
        }

        setStatus(data.status ?? "pending");
        setProviderStatus(data.providerStatus ?? "Pending");
        setEmbedUrl((current) => data.embedUrl ?? current ?? null);
      } catch {
        if (!isBackground) {
          setStartError((current) => current ?? "Unable to refresh DIDIT status.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sessionId],
  );

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
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== DIDIT_ORIGIN) return;
      const payload = event.data as { type?: string; status?: string } | null;
      if (!payload?.status) return;
      setProviderStatus(payload.status);
      setStatus(normalizeStatus(payload.status));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!sessionId) {
      void startDiditSession();
      return;
    }
    if (status === "verified") {
      setLoading(false);
      return;
    }
    void refreshStatus();
    const timer = window.setInterval(() => void refreshStatus(true), 7000);
    return () => window.clearInterval(timer);
  }, [isLoaded, refreshStatus, sessionId, startDiditSession, status]);

  useEffect(() => {
    if (status !== "verified") return;
    setRedirecting(true);
    const timer = window.setTimeout(() => router.push("/documents"), 1200);
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

  const showEmbed = Boolean(embedUrl) && status !== "verified" && !starting && !startError;

  return (
    <Card className="glass-panel rounded-2xl">
      <CardHeader className="space-y-4">
        {badge}
        <div>
          <CardTitle>Embedded DIDIT verification</CardTitle>
          <CardDescription>
            Verification stays inside Visual Era. DIDIT handles document capture and decisions; we never store raw ID images.
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
                <p className="text-sm leading-6 text-muted-foreground">
                  {redirecting ? "Redirecting you to documents…" : "DIDIT has completed the identity step."}
                </p>
              </div>
            </div>
          </div>
        ) : !isLoaded || starting ? (
          <div className="flex min-h-[760px] items-center justify-center rounded-2xl border border-white/10 bg-black/20">
            <div className="text-center">
              <LoaderCircle className="mx-auto size-7 animate-spin text-accent" />
              <p className="mt-4 text-sm text-muted-foreground">
                {!isLoaded ? "Loading your account…" : "Starting your DIDIT verification session…"}
              </p>
            </div>
          </div>
        ) : showEmbed ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <iframe
              title="DIDIT identity verification"
              src={embedUrl!}
              className="min-h-[760px] w-full bg-black"
              allow="camera; microphone; fullscreen; autoplay; encrypted-media"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-6 text-sm leading-6 text-muted-foreground">
            {startError ??
              "DIDIT could not load. Confirm DIDIT_API_KEY and DIDIT_WORKFLOW_ID are set in Vercel, redeploy, then refresh this page."}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => void refreshStatus()} disabled={refreshing || !sessionId}>
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

          {startError ? (
            <Button variant="outline" onClick={() => void startDiditSession()}>
              Try again
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
