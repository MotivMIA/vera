"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAuthFinalizeNavigate } from "@/lib/clerk/finalize-auth";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

const SSO_CALLBACK_SIGN_IN = "/sign-in/sso-callback";
const SSO_CALLBACK_SIGN_UP = "/sign-up/sso-callback";

type AuthMode = "sign-in" | "sign-up";

type OAuthStrategy = "oauth_google" | "oauth_x";

const OAUTH_PROVIDERS: { strategy: OAuthStrategy; label: string }[] = [
  { strategy: "oauth_google", label: "Continue with Google" },
  { strategy: "oauth_x", label: "Continue with X" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SiteAuthPanel({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { signIn, errors: signInErrors, fetchStatus: signInFetch } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetch } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [needsEmailCode, setNeedsEmailCode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const errors = isSignUp ? signUpErrors : signInErrors;
  const fetchStatus = isSignUp ? signUpFetch : signInFetch;
  const isLoading = fetchStatus === "fetching";

  const finalizeNavigate = createAuthFinalizeNavigate(router);

  async function handleOAuth(strategy: OAuthStrategy) {
    setFormError(null);
    const callbackUrl = isSignUp ? SSO_CALLBACK_SIGN_UP : SSO_CALLBACK_SIGN_IN;
    const auth = isSignUp ? signUp : signIn;
    if (!auth) {
      setFormError("Auth is still loading. Try again in a moment.");
      return;
    }

    const { error } = await auth.sso({
      strategy,
      redirectUrl: ONBOARDING_ENTRY_PATH,
      redirectCallbackUrl: callbackUrl,
    });

    if (error) {
      setFormError(error.message ?? "Could not start social sign-in.");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (isSignUp && needsEmailCode) {
      if (!signUp) return;
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });
      if (verifyError) {
        setFormError(verifyError.message ?? "Invalid verification code.");
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: finalizeNavigate });
      }
      return;
    }

    if (isSignUp) {
      if (!signUp) return;
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      if (error) {
        setFormError(error.message ?? "Could not create account.");
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: finalizeNavigate });
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.message ?? "Could not send verification email.");
        return;
      }
      setNeedsEmailCode(true);
      return;
    }

    if (!signIn) return;
    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });
    if (error) {
      setFormError(error.message ?? "Could not sign in.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: finalizeNavigate });
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-[#f6f4ef]">
      <div className="space-y-3">
        {OAUTH_PROVIDERS.map(({ strategy, label }) => (
          <Button
            key={strategy}
            type="button"
            variant="outline"
            className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
            disabled={isLoading}
            onClick={() => void handleOAuth(strategy)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wider text-[#6b7280]">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignUp && !needsEmailCode ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#9da3af]">
                First name
              </Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#9da3af]">
                Last name
              </Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {needsEmailCode ? (
          <div className="space-y-2">
            <Label htmlFor="code" className="text-[#9da3af]">
              Verification code
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter code from email"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <FieldError message={errors?.fields?.code?.message} />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#9da3af]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldError
                message={
                  (errors?.fields as { identifier?: { message?: string }; emailAddress?: { message?: string } })
                    ?.identifier?.message ??
                  (errors?.fields as { emailAddress?: { message?: string } })?.emailAddress?.message
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#9da3af]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldError message={errors?.fields?.password?.message} />
            </div>
          </>
        )}

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Please wait…
            </>
          ) : needsEmailCode ? (
            "Verify email"
          ) : isSignUp ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}
