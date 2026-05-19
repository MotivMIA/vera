import { Suspense } from "react";
import { DiditEmbed } from "@/components/onboarding/didit-embed";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function VerifyIdentityPage() {
  return (
    <OnboardingShell
      eyebrow="Step 2 of 4"
      title="Verify your identity"
      description="DIDIT runs directly inside Visual Era for a tighter onboarding flow. Visual Era never stores raw ID images."
      progress={50}
    >
      <Suspense fallback={null}>
        <DiditEmbed />
      </Suspense>
    </OnboardingShell>
  );
}
