"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClerkLoaded, ClerkLoading, SignIn, SignUp, UserButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clerkSignInComponentProps,
  clerkSignUpComponentProps,
} from "@/lib/clerk/auth-component-props";
import { clerkAppearance } from "@/lib/clerk/appearance";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

type AuthMode = "sign-up" | "sign-in";

function AuthTabs({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
      <button
        type="button"
        onClick={() => onModeChange("sign-up")}
        className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
          mode === "sign-up" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
        }`}
      >
        Create account
      </button>
      <button
        type="button"
        onClick={() => onModeChange("sign-in")}
        className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
          mode === "sign-in" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
        }`}
      >
        Sign in
      </button>
    </div>
  );
}

function AuthLoadingShell() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
        <div className="rounded-[0.9rem] bg-white py-2.5 text-center text-sm font-medium text-[#090a0d]">
          Create account
        </div>
        <div className="rounded-[0.9rem] py-2.5 text-center text-sm font-medium text-[#9da3af]">Sign in</div>
      </div>
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <LoaderCircle className="size-5 animate-spin text-[#d8b56d]" />
      </div>
    </div>
  );
}

function ClerkAuthPanel({ mode }: { mode: AuthMode }) {
  const shellClass =
    "auth-clerk-embed overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6";

  if (mode === "sign-up") {
    return (
      <div className={shellClass}>
        <SignUp key="sign-up" {...clerkSignUpComponentProps} appearance={clerkAppearance} routing="hash" />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <SignIn key="sign-in" {...clerkSignInComponentProps} appearance={clerkAppearance} routing="hash" />
    </div>
  );
}

function AuthCardContent({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (isSignedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-[#f6f4ef]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#9da3af]">Authenticated</p>
            <h3 className="mt-2 text-2xl font-semibold">Continue onboarding</h3>
          </div>
          <UserButton />
        </div>
        <div className="rounded-2xl border border-[#d8b56d]/20 bg-[#d8b56d]/10 p-4 text-sm leading-6 text-[#d7dbe2]">
          <ShieldCheck className="mb-3 size-5 text-[#d8b56d]" />
          Your account is active and ready to continue.
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href={ONBOARDING_ENTRY_PATH}>
            Continue onboarding
            <ArrowRight className="ml-auto size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthTabs mode={mode} onModeChange={setMode} />
      <ClerkAuthPanel mode={mode} />
      <p className="mt-4 text-center text-xs text-[#6b7280]">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-[#d8b56d] underline-offset-2 hover:underline"
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              className="text-[#d8b56d] underline-offset-2 hover:underline"
              onClick={() => setMode("sign-up")}
            >
              Create an account
            </button>
          </>
        )}
      </p>
    </>
  );
}

export type AuthCardProps = {
  initialMode?: AuthMode;
};

export function AuthCard({ initialMode = "sign-up" }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <AuthLoadingShell />
      </ClerkLoading>
      <ClerkLoaded>
        <AuthCardContent initialMode={initialMode} />
      </ClerkLoaded>
    </div>
  );
}
