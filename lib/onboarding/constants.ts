import {
  DOCUMENTS_PATH,
  ONBOARDING_ENTRY_PATH,
  SUCCESS_PATH,
  VERIFY_IDENTITY_PATH,
} from "@/lib/routes";
import type { OnboardingStep } from "@/types/onboarding";

export { ONBOARDING_ENTRY_PATH } from "@/lib/routes";

export const ONBOARDING_STEP_ORDER: OnboardingStep[] = ["consent", "identity", "documents", "complete"];

export const ONBOARDING_STEP_PATH: Record<OnboardingStep, string> = {
  consent: ONBOARDING_ENTRY_PATH,
  identity: VERIFY_IDENTITY_PATH,
  documents: DOCUMENTS_PATH,
  complete: SUCCESS_PATH,
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
