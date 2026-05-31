import { Suspense } from "react";
import { DiditEmbed } from "@/components/onboarding/didit-embed";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ONBOARDING_STEP_PROGRESS, stepLabel } from "@/lib/onboarding/constants";
import { enforceOnboardingPath } from "@/lib/onboarding/guards";

export default async function VerifyIdentityPage() {
  await enforceOnboardingPath("/verify-identity");

  return (
    <OnboardingShell
      eyebrow={stepLabel("identity")}
      title="Verify your identity"
      description="DIDIT runs directly inside Visual Era for a tighter onboarding flow. Visual Era never stores raw ID images."
      progress={ONBOARDING_STEP_PROGRESS.identity}
    >
      <Suspense fallback={null}>
        <DiditEmbed />
      </Suspense>
    </OnboardingShell>
  );
}
