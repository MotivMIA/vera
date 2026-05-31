import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpView } from "@/components/auth/sign-up-view";
import { getOnboardingSnapshot, resolveNextOnboardingPath } from "@/lib/onboarding/status";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    const snapshot = await getOnboardingSnapshot(userId);
    redirect(resolveNextOnboardingPath(snapshot));
  }

  return <SignUpView />;
}
