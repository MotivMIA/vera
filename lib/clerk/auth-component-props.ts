import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

const redirectProps = {
  fallbackRedirectUrl: ONBOARDING_ENTRY_PATH,
  forceRedirectUrl: ONBOARDING_ENTRY_PATH,
} as const;

/** Props for <SignUp /> — includes OAuth (Google, X, …) when enabled in Clerk Dashboard. */
export const clerkSignUpComponentProps = {
  ...redirectProps,
  oauthFlow: "auto" as const,
  signInUrl: "/sign-in",
};

/** Props for <SignIn /> — includes OAuth when enabled in Clerk Dashboard. */
export const clerkSignInComponentProps = {
  ...redirectProps,
  oauthFlow: "auto" as const,
  signUpUrl: "/sign-up",
};
