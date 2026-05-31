import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

type FinalizeNavigateArgs = {
  session?: { currentTask?: { key: string } | null } | null;
  decorateUrl: (path: string) => string;
};

export function createAuthFinalizeNavigate(router: AppRouterInstance) {
  return async ({ session, decorateUrl }: FinalizeNavigateArgs) => {
    const destination = session?.currentTask
      ? `/sign-in/tasks/${session.currentTask.key}`
      : ONBOARDING_ENTRY_PATH;
    const url = decorateUrl(destination);
    if (url.startsWith("http")) {
      window.location.href = url;
      return;
    }
    router.push(url);
  };
}
