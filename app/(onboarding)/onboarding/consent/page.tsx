import { ConsentForm } from "@/components/onboarding/consent-form";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { enforceOnboardingPath } from "@/lib/onboarding/guards";
import { ONBOARDING_STEP_PROGRESS, stepLabel } from "@/lib/onboarding/constants";

export default async function ConsentPage() {
  await enforceOnboardingPath("/onboarding/consent");

  return (
    <OnboardingShell
      eyebrow={stepLabel("consent")}
      title="Consent and disclosures"
      description="Review and accept required policies before Visual Era starts your secure identity verification session."
      progress={ONBOARDING_STEP_PROGRESS.consent}
    >
      <ConsentForm />
    </OnboardingShell>
  );
}
