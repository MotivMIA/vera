import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOnboardingSnapshot, resolveOnboardingRedirect } from "@/lib/onboarding/status";

export async function requireAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
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
