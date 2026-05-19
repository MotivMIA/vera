import { Suspense } from "react";
import { DiditEmbed } from "@/components/onboarding/didit-embed";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function VerifyIdentityPage() {
  return (
    <OnboardingShell
      eyebrow="Step 1 of 3"
      title="Verify your identity"
      description="DIDIT runs directly inside Visual Era for a tighter onboarding flow. Visual Era never stores raw ID images."
      progress={34}
    >
      <Suspense fallback={null}>
        <DiditEmbed />
      </Suspense>
    </OnboardingShell>
  );
}
