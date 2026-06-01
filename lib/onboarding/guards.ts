import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/i18n/preferred-locale";
import { getOnboardingSnapshot, resolveOnboardingRedirect } from "@/lib/onboarding/status";
import { authSignInPath } from "@/lib/routes";

export async function requireAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    const locale = await getPreferredLocale();
    redirect(authSignInPath(locale));
  }
  return userId;
}

export async function enforceOnboardingPath(pathname: string) {
  const userId = await requireAuthUserId();
  const snapshot = await getOnboardingSnapshot(userId);
  const next = resolveOnboardingRedirect(snapshot, pathname);
  if (next) {
    redirect(next);
  }
  return { userId, snapshot };
}

export async function getClerkProfile() {
  const user = await currentUser();
  return {
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    fullName: user?.fullName ?? null,
  };
}
