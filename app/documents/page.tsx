import { DocumentsStepIndicators } from "@/components/onboarding/documents-step-indicators";
import { InternalSigningPacket } from "@/components/onboarding/internal-signing-packet";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <OnboardingShell
      eyebrow="Step 3 of 4"
      title="Sign your creator agreements"
      description="Complete both internal agreements below. Your signatures are captured in-app and stored with an auditable timestamp."
      progress={75}
      asideExtra={<DocumentsStepIndicators />}
    >
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle>Agreement signing</CardTitle>
          <CardDescription>Review and sign each document below to complete onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <InternalSigningPacket />
        </CardContent>
      </Card>
    </OnboardingShell>
  );
}
