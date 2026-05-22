"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const consents = [
  {
    id: "terms",
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
    label: "I consent to use electronic signatures for onboarding documents.",
  },
] as const;

export function ConsentForm() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const ready = useMemo(() => consents.every((item) => checked[item.id]), [checked]);

  async function startVerification() {
    if (!ready) {
      toast.error("Please accept each consent item before continuing.");
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
          {consents.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <Checkbox
                id={item.id}
                checked={checked[item.id] ?? false}
                onCheckedChange={(value) => setChecked((current) => ({ ...current, [item.id]: value === true }))}
              />
              <Label htmlFor={item.id} className="leading-6 text-muted-foreground">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mb-3 size-5 text-accent" />
          DIDIT handles identity verification and ID documents. Visual Era stores verification status and audit metadata only.{" "}
          <Link href="/legal" className="text-accent underline-offset-4 hover:underline">
            View all legal documents
          </Link>
          .
        </div>
        <Button className="w-full" size="lg" onClick={() => void startVerification()} disabled={!ready || submitting}>
          {submitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
          Continue to identity verification
        </Button>
      </CardContent>
    </Card>
  );
}
