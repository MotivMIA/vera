"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignUp, UserButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

const clerkSignUpProps = {
  fallbackRedirectUrl: ONBOARDING_ENTRY_PATH,
  forceRedirectUrl: ONBOARDING_ENTRY_PATH,
  oauthFlow: "auto" as const,
  signInUrl: "/sign-in",
};

function AuthTabs({
  mode,
  onModeChange,
}: {
  mode: "sign-up" | "sign-in";
  onModeChange: (mode: "sign-up" | "sign-in") => void;
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

export function AuthCard() {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [timedOut, setTimedOut] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      setTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), 12_000);
    return () => window.clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-md space-y-4">
        <AuthTabs mode={mode} onModeChange={setMode} />
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-center">
          <LoaderCircle className="size-5 animate-spin text-[#d8b56d]" />
          {timedOut ? (
            <>
              <p className="text-sm leading-6 text-[#9da3af]">
                Auth is taking longer than expected. You can continue on the dedicated sign-in page.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/sign-in">Open sign in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/15 bg-transparent">
                <Link href="/sign-up">Open sign up</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="w-full max-w-md">
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <AuthTabs mode={mode} onModeChange={setMode} />
      {mode === "sign-up" ? (
        <SignUp key="sign-up" {...clerkSignUpProps} routing="hash" />
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-[#f6f4ef]">
          <p className="text-sm leading-6 text-[#9da3af]">
            Sign in on the secure auth page for the most reliable experience.
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">Continue to sign in</Link>
          </Button>
          <p className="text-xs text-[#6b7280]">
            New here?{" "}
            <button type="button" className="text-[#d8b56d] underline-offset-2 hover:underline" onClick={() => setMode("sign-up")}>
              Create an account
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
