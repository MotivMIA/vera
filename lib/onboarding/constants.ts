import type { OnboardingStep } from "@/types/onboarding";

export const ONBOARDING_STEP_ORDER: OnboardingStep[] = ["consent", "identity", "documents", "complete"];

export const ONBOARDING_STEP_PATH: Record<OnboardingStep, string> = {
  consent: "/onboarding/consent",
  identity: "/verify-identity",
  documents: "/documents",
  complete: "/success",
};

export const ONBOARDING_STEP_PROGRESS: Record<OnboardingStep, number> = {
  consent: 25,
  identity: 50,
  documents: 75,
  complete: 100,
};

export function stepLabel(step: OnboardingStep): string {
  const index = ONBOARDING_STEP_ORDER.indexOf(step);
  return `Step ${index + 1} of ${ONBOARDING_STEP_ORDER.length}`;
}
