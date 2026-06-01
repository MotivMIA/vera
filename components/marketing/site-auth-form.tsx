"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { navigateAfterAuthFinalize } from "@/lib/clerk/finalize-session";
import { pathWithLocale } from "@/lib/i18n/paths";
import { ONBOARDING_ENTRY_PATH } from "@/lib/routes";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import type { SocialSpriteIconVariant } from "@/lib/brand/social-sprite";
import {
  borderDefaultClass,
  fluidCaptionClass,
  fluidH2Class,
  panelShellClass,
  panelSurfaceClass,
  panelSurfaceEmphasisHoverClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

const inputClassName =
  "border-border-default bg-black/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-accent/40";

const SSO_PROVIDERS: {
  strategy: "oauth_google" | "oauth_x";
  labelKey: "continueGoogle" | "continueX";
  icon: SocialSpriteIconVariant;
}[] = [
  { strategy: "oauth_google", labelKey: "continueGoogle", icon: "google" },
  { strategy: "oauth_x", labelKey: "continueX", icon: "x" },
];

function isIdentifierNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("errors" in error)) return false;
  const errors = (error as { errors?: Array<{ code?: string }> }).errors;
  return errors?.[0]?.code === "form_identifier_not_found";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={cn(fluidCaptionClass, "text-destructive")}>{message}</p>;
}

function AuthPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(panelShellClass, className)}>{children}</div>;
}

function SocialButtons({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("Auth.form");
  const locale = useLocale();
  const { signIn } = useSignIn();
  const callbackUrl = pathWithLocale(locale, "/sign-in/sso-callback");

  async function handleSso(strategy: (typeof SSO_PROVIDERS)[number]["strategy"]) {
    await signIn.sso({
      strategy,
      redirectUrl: ONBOARDING_ENTRY_PATH,
      redirectCallbackUrl: callbackUrl,
    });
  }

  return (
    <div className="space-y-2">
      {SSO_PROVIDERS.map((provider) => (
        <Button
          key={provider.strategy}
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full text-fluid-small font-medium text-foreground",
            borderDefaultClass,
            panelSurfaceClass,
            panelSurfaceEmphasisHoverClass,
            "hover:text-foreground",
          )}
          disabled={disabled}
          onClick={() => void handleSso(provider.strategy)}
        >
          <span className="flex w-full items-center justify-center gap-3">
            <SocialSpriteIcon variant={provider.icon} className="size-5" />
            <span>{t(provider.labelKey)}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}

export function SiteAuthForm() {
  const t = useTranslations("Auth.form");
  const router = useRouter();
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  /** Sign-up email verification (new account path). */
  const [verifyingNewAccount, setVerifyingNewAccount] = useState(false);

  const busy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const errors = verifyingNewAccount ? signUpErrors : signInErrors;

  async function finalizeSignIn() {
    if (signIn.status !== "complete") return;
    await signIn.finalize({
      navigate: (args) => navigateAfterAuthFinalize(router, args),
    });
  }

  async function finalizeSignUp() {
    if (signUp.status !== "complete") return;
    await signUp.finalize({
      navigate: (args) => navigateAfterAuthFinalize(router, args),
    });
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();

    const signInResult = await signIn.password({ emailAddress: email, password });

    if (signInResult.error && isIdentifierNotFound(signInResult.error)) {
      const signUpResult = await signUp.password({ emailAddress: email, password });
      if (signUpResult.error) return;

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields?.includes("email_address") &&
        (signUp.missingFields?.length ?? 0) === 0
      ) {
        await signUp.verifications.sendEmailCode();
        setVerifyingNewAccount(true);
      }
      return;
    }

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
      return;
    }

    await finalizeSignIn();
  }

  async function handleVerifySubmit(event: React.FormEvent) {
    event.preventDefault();

    if (verifyingNewAccount) {
      const verifyResult = await signUp.verifications.verifyEmailCode({ code });
      if (verifyResult.error) return;
      await finalizeSignUp();
      return;
    }

    const verifyResult = await signIn.mfa.verifyEmailCode({ code });
    if (verifyResult.error) return;
    await finalizeSignIn();
  }

  const needsSignInVerification =
    !verifyingNewAccount &&
    (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust");

  if (verifyingNewAccount || needsSignInVerification) {
    const isNewAccount = verifyingNewAccount;

    return (
      <AuthPanel>
        <h3 className={fluidH2Class}>{isNewAccount ? t("verifyEmailTitle") : t("verifyTitle")}</h3>
        <p className="mt-1 text-fluid-small text-muted-foreground">
          {isNewAccount
            ? t.rich("verifyEmailSent", {
                highlight: () => <span className="text-foreground">{email}</span>,
              })
            : t("verifyEmailHint")}
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleVerifySubmit}>
          <div className="space-y-2">
            <Label htmlFor="auth-code">{t("verificationCode")}</Label>
            <Input
              id="auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClassName}
            />
            <FieldError message={errors?.fields?.code?.message} />
          </div>
          <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : t("verify")}
          </Button>
        </form>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <SocialButtons disabled={busy} />
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1 bg-border-default" />
        <span className={cn(fluidCaptionClass, "uppercase tracking-wider text-muted-foreground")}>
          {t("or")}
        </span>
        <Separator className="flex-1 bg-border-default" />
      </div>
      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
        <div className="space-y-2">
          <Label htmlFor="auth-email">{t("email")}</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            required
          />
          <FieldError
            message={
              verifyingNewAccount
                ? signUpErrors?.fields?.emailAddress?.message
                : signInErrors?.fields?.identifier?.message
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">{t("password")}</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            required
          />
          <FieldError message={errors?.fields?.password?.message} />
        </div>
        {errors?.global?.[0]?.message ? (
          <p className={cn(fluidCaptionClass, "text-destructive")}>{errors.global[0].message}</p>
        ) : null}
        <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : t("continue")}
        </Button>
      </form>
      <div id="clerk-captcha" />
    </AuthPanel>
  );
}
