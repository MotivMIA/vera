"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const consents = [
  {
    id: "terms",
    shortLabel: "Terms of Service",
    label: (
      <>
        I accept the Visual Era{" "}
        <Link href="/legal/terms" className="text-accent underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        .
      </>
    ),
  },
  {
    id: "privacy",
    shortLabel: "Privacy Policy",
    label: (
      <>
        I acknowledge the{" "}
        <Link href="/legal/privacy" className="text-accent underline-offset-4 hover:underline">
          Privacy Policy
        </Link>{" "}
        and data processing notice.
      </>
    ),
  },
  {
    id: "esign",
    shortLabel: "electronic signatures",
    label: "I consent to use electronic signatures for onboarding documents.",
  },
] as const;

export function ConsentForm() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const missing = useMemo(
    () => consents.filter((item) => !checked[item.id]),
    [checked],
  );
  const ready = missing.length === 0;

  const missingSummary = useMemo(
    () => missing.map((item) => item.shortLabel).join(", "),
    [missing],
  );

  function handleCheckedChange(id: string, value: boolean) {
    setChecked((current) => ({ ...current, [id]: value }));
    if (value) {
      setShowValidation(false);
    }
  }

  function handleContinueAttempt() {
    if (ready || submitting) {
      return;
    }
    setShowValidation(true);
  }

  async function startVerification() {
    if (!ready) {
      setShowValidation(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/consent", { method: "POST" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save consent.");
      }
      router.push("/verify-identity");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save consent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="glass-panel rounded-2xl">
      <CardHeader>
        <CardTitle>Consent and disclosures</CardTitle>
        <CardDescription>Complete this step before Visual Era creates your secure DIDIT verification session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {consents.map((item) => {
            const isMissing = !checked[item.id];
            const showError = showValidation && isMissing;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-4 transition-colors",
                  showError
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-white/10 bg-white/[0.035]",
                )}
              >
                <div className="flex gap-3">
                  <Checkbox
                    id={item.id}
                    checked={checked[item.id] ?? false}
                    aria-invalid={showError}
                    onCheckedChange={(value) => handleCheckedChange(item.id, value === true)}
                  />
                  <Label htmlFor={item.id} className="leading-6 text-muted-foreground">
                    {item.label}
                  </Label>
                </div>
                {showError ? (
                  <p className="flex items-start gap-2 pl-7 text-sm text-red-200" role="alert">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                    Accept {item.shortLabel} to continue.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mb-3 size-5 text-accent" />
          DIDIT handles identity verification and ID documents. Visual Era stores verification status and audit metadata only.{" "}
          <Link href="/legal" className="text-accent underline-offset-4 hover:underline">
            View all legal documents
          </Link>
          .
        </div>
        {!ready ? (
          <p
            id="consent-continue-hint"
            className={cn(
              "text-sm leading-6",
              showValidation ? "text-red-200" : "text-muted-foreground",
            )}
          >
            {showValidation ? (
              <>
                <span className="font-medium text-foreground">Still required:</span> {missingSummary}
              </>
            ) : (
              <>
                Check all {consents.length} items above to unlock identity verification
                {missing.length < consents.length ? ` (${missing.length} remaining).` : "."}
              </>
            )}
          </p>
        ) : null}
        <div className="relative">
          <Button
            className={cn("w-full", !ready && "pointer-events-none")}
            size="lg"
            onClick={() => void startVerification()}
            disabled={!ready || submitting}
            aria-describedby={!ready ? "consent-continue-hint" : undefined}
          >
            {submitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
            {ready
              ? "Continue to identity verification"
              : showValidation
                ? `Accept ${missing.length} more item${missing.length === 1 ? "" : "s"} to continue`
                : `Accept all consents to continue (${missing.length} remaining)`}
          </Button>
          {!ready && !submitting ? (
            <button
              type="button"
              className="absolute inset-0 cursor-pointer rounded-lg"
              aria-label={`Continue disabled. Accept ${missingSummary} first.`}
              onClick={handleContinueAttempt}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
