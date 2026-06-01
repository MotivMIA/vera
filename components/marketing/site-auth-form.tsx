"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { navigateAfterAuthFinalize } from "@/lib/clerk/finalize-session";
import { ONBOARDING_ENTRY_PATH } from "@/lib/routes";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import type { SocialSpriteIconVariant } from "@/lib/brand/social-sprite";
import {
  borderDefaultClass,
  panelShellClass,
  panelSurfaceClass,
  panelSurfaceEmphasisHoverClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

const inputClassName =
  "border-border-default bg-black/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-accent/40";

const SSO_PROVIDERS: {
  strategy: "oauth_google" | "oauth_x";
  label: string;
  icon: SocialSpriteIconVariant;
}[] = [
  { strategy: "oauth_google", label: "Continue with Google", icon: "google" },
  { strategy: "oauth_x", label: "Continue with X", icon: "x" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function AuthPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(panelShellClass, className)}>{children}</div>;
}

function SocialButtons({
  mode,
  disabled,
}: {
  mode: "sign-in" | "sign-up";
  disabled?: boolean;
}) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const callbackUrl = mode === "sign-in" ? "/sign-in/sso-callback" : "/sign-up/sso-callback";

  async function handleSso(strategy: (typeof SSO_PROVIDERS)[number]["strategy"]) {
    if (mode === "sign-in") {
      await signIn.sso({
        strategy,
        redirectUrl: ONBOARDING_ENTRY_PATH,
        redirectCallbackUrl: callbackUrl,
      });
      return;
    }
    await signUp.sso({
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
            "h-11 w-full text-sm font-medium text-foreground",
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
            <span>{provider.label}</span>
          </span>
        </Button>
      ))}
    </div>
  );
}

function SiteSignInForm() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const busy = fetchStatus === "fetching";

  async function finalizeIfComplete() {
    if (signIn.status !== "complete") return;
    await signIn.finalize({
      navigate: (args) => navigateAfterAuthFinalize(router, args),
    });
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    await signIn.password({ emailAddress: email, password });
    if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendEmailCode();
    }
    await finalizeIfComplete();
  }

  async function handleMfaSubmit(event: React.FormEvent) {
    event.preventDefault();
    await signIn.mfa.verifyEmailCode({ code: mfaCode });
    await finalizeIfComplete();
  }

  if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
    return (
      <AuthPanel>
        <h3 className="text-lg font-semibold">Verify it&apos;s you</h3>
        <p className="mt-1 text-sm text-muted-foreground">Enter the code we sent to your email.</p>
        <form className="mt-5 space-y-4" onSubmit={handleMfaSubmit}>
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className={inputClassName}
            />
            <FieldError message={errors?.fields?.code?.message} />
          </div>
          <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Verify"}
          </Button>
        </form>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <SocialButtons mode="sign-in" disabled={busy} />
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1 bg-border-default" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
        <Separator className="flex-1 bg-border-default" />
      </div>
      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
        <div className="space-y-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            required
          />
          <FieldError message={errors?.fields?.identifier?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-in-password">Password</Label>
          <Input
            id="sign-in-password"
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
          <p className="text-xs text-destructive">{errors.global[0].message}</p>
        ) : null}
        <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </AuthPanel>
  );
}

function SiteSignUpForm() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const busy = fetchStatus === "fetching";

  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address");

  async function finalizeIfComplete() {
    if (signUp.status !== "complete") return;
    await signUp.finalize({
      navigate: (args) => navigateAfterAuthFinalize(router, args),
    });
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    await signUp.password({ emailAddress: email, password });
    if (signUp.status === "missing_requirements" && signUp.unverifiedFields?.includes("email_address")) {
      await signUp.verifications.sendEmailCode();
      return;
    }
    await finalizeIfComplete();
  }

  async function handleVerifySubmit(event: React.FormEvent) {
    event.preventDefault();
    await signUp.verifications.verifyEmailCode({ code });
    await finalizeIfComplete();
  }

  if (needsVerification) {
    return (
      <AuthPanel>
        <h3 className="text-lg font-semibold">Verify your email</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a code to <span className="text-foreground">{email}</span>.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleVerifySubmit}>
          <div className="space-y-2">
            <Label htmlFor="sign-up-code">Verification code</Label>
            <Input
              id="sign-up-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClassName}
            />
            <FieldError message={errors?.fields?.code?.message} />
          </div>
          <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Create account"}
          </Button>
        </form>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <SocialButtons mode="sign-up" disabled={busy} />
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1 bg-border-default" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
        <Separator className="flex-1 bg-border-default" />
      </div>
      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
        <div className="space-y-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            required
          />
          <FieldError message={errors?.fields?.emailAddress?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            required
          />
          <FieldError message={errors?.fields?.password?.message} />
        </div>
        {errors?.global?.[0]?.message ? (
          <p className="text-xs text-destructive">{errors.global[0].message}</p>
        ) : null}
        <Button type="submit" className="h-11 w-full" variant="accent" disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export type SiteAuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function SiteAuthForm({ mode }: SiteAuthFormProps) {
  return mode === "sign-in" ? <SiteSignInForm /> : <SiteSignUpForm />;
}
