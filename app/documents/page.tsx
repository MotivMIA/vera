import { DocumentsStepIndicators } from "@/components/onboarding/documents-step-indicators";
import { InternalSigningPacket } from "@/components/onboarding/internal-signing-packet";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ONBOARDING_STEP_PROGRESS, stepLabel } from "@/lib/onboarding/constants";
import { enforceOnboardingPath } from "@/lib/onboarding/guards";

export default async function DocumentsPage() {
  await enforceOnboardingPath("/documents");

  return (
    <OnboardingShell
      eyebrow={stepLabel("documents")}
      title="Sign your creator agreements"
      description="Complete both internal agreements below. Your signatures are captured in-app and stored with an auditable timestamp."
      progress={ONBOARDING_STEP_PROGRESS.documents}
      asideExtra={<DocumentsStepIndicators />}
    >
      <InternalSigningPacket />
    </OnboardingShell>
  );
}
