import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

export default function SignUpSsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl={ONBOARDING_ENTRY_PATH}
      signUpFallbackRedirectUrl={ONBOARDING_ENTRY_PATH}
    />
  );
}
