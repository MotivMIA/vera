import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ONBOARDING_ENTRY_PATH } from "@/lib/routes";

type FinalizeNavigateArgs = {
  session: { currentTask?: { key: string } | null };
  decorateUrl: (path: string) => string;
};

export function authDestinationAfterSession(session: FinalizeNavigateArgs["session"]): string {
  if (session?.currentTask) {
    return `/sign-in/tasks/${session.currentTask.key}`;
  }
  return ONBOARDING_ENTRY_PATH;
}

export async function navigateAfterAuthFinalize(
  router: AppRouterInstance,
  { session, decorateUrl }: FinalizeNavigateArgs,
): Promise<void> {
  const destination = authDestinationAfterSession(session);
  const url = decorateUrl(destination);
  if (url.startsWith("http")) {
    window.location.href = url;
    return;
  }
  router.push(url);
}
