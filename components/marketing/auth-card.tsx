"use client";

import { useState } from "react";
import Link from "next/link";
import { ClerkLoaded, ClerkLoading, SignIn, SignUp, UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

type AuthMode = "sign-up" | "sign-in";

const clerkEmbedProps = {
  fallbackRedirectUrl: ONBOARDING_ENTRY_PATH,
  forceRedirectUrl: ONBOARDING_ENTRY_PATH,
  oauthFlow: "auto" as const,
  routing: "hash" as const,
};

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
        <div className="rounded-[0.9rem] bg-white text-center text-sm font-medium text-[#090a0d]">Create account</div>
        <div className="rounded-[0.9rem] text-center text-sm font-medium text-[#9da3af]">Sign in</div>
      </div>
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <LoaderCircle className="size-5 animate-spin text-[#d8b56d]" />
      </div>
    </div>
  );
}

function AuthCardContent() {
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const { isSignedIn } = useUser();

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
      {mode === "sign-up" ? (
        <SignUp key="sign-up" {...clerkEmbedProps} signInUrl="/sign-in" />
      ) : (
        <SignIn key="sign-in" {...clerkEmbedProps} signUpUrl="/sign-up" />
      )}
    </>
  );
}

export function AuthCard() {
  return (
    <div className="w-full max-w-md">
      <ClerkLoading>
        <AuthLoadingShell />
      </ClerkLoading>

      <ClerkLoaded>
        <AuthCardContent />
      </ClerkLoaded>
    </div>
  );
}
