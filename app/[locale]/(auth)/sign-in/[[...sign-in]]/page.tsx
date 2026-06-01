import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInView } from "@/components/auth/sign-in-view";
import { getOnboardingSnapshot, resolveNextOnboardingPath } from "@/lib/onboarding/status";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    const snapshot = await getOnboardingSnapshot(userId);
    redirect(resolveNextOnboardingPath(snapshot));
  }

  return <SignInView />;
}
