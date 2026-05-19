import { ConsentForm } from "@/components/onboarding/consent-form";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function OnboardingPage() {
  return (
    <OnboardingShell
      eyebrow="Step 1 of 4"
      title="Start with secure consent"
      description="Review the required onboarding acknowledgements before Visual Era creates a dedicated identity verification session."
      progress={25}
    >
      <ConsentForm />
    </OnboardingShell>
  );
}
