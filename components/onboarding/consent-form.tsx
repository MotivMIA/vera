"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const consents = [
  { id: "terms", label: "I accept the Visual Era Terms of Service." },
  { id: "privacy", label: "I acknowledge the Privacy Policy and data processing notice." },
  { id: "esign", label: "I consent to use electronic signatures for onboarding documents." },
] as const;

export function ConsentForm() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const ready = useMemo(() => consents.every((item) => checked[item.id]), [checked]);

  function startVerification() {
    if (!ready) {
      toast.error("Please accept each consent item before continuing.");
      return;
    }

    router.push("/verify-identity");
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
          DIDIT handles identity verification and ID documents. Visual Era stores verification status and audit metadata only.
        </div>
        <Button className="w-full" size="lg" onClick={startVerification} disabled={!ready}>
          <ArrowRight />
          Continue to identity verification
        </Button>
      </CardContent>
    </Card>
  );
}
