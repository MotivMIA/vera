import { DocumentsStepIndicators } from "@/components/onboarding/documents-step-indicators";
import { InternalSigningPacket } from "@/components/onboarding/internal-signing-packet";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function DocumentsPage() {
  return (
    <OnboardingShell
      eyebrow="Step 3 of 4"
      title="Sign your creator agreements"
      description="Complete both internal agreements below. Your signatures are captured in-app and stored with an auditable timestamp."
      progress={75}
      asideExtra={<DocumentsStepIndicators />}
    >
      <InternalSigningPacket />
    </OnboardingShell>
  );
}
