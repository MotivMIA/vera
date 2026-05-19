"use client";

import { useState } from "react";
import Link from "next/link";
import { SignIn, SignUp, UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthMode = "sign-up" | "sign-in";

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="w-full max-w-md">
      {!isLoaded ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
            <div className="rounded-[0.9rem] bg-white text-center text-sm font-medium text-[#090a0d]">Create account</div>
            <div className="rounded-[0.9rem] text-center text-sm font-medium text-[#9da3af]">Sign in</div>
          </div>
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <LoaderCircle className="size-5 animate-spin text-[#d8b56d]" />
          </div>
        </div>
      ) : null}

      {isLoaded && !isSignedIn ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
                mode === "sign-up" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
                mode === "sign-in" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
              }`}
            >
              Sign in
            </button>
          </div>

          {mode === "sign-up" ? (
            <SignUp
              key="sign-up"
              fallbackRedirectUrl="/verify-identity"
              forceRedirectUrl="/verify-identity"
              oauthFlow="auto"
              routing="hash"
              signInUrl="/sign-in"
            />
          ) : (
            <SignIn
              key="sign-in"
              fallbackRedirectUrl="/verify-identity"
              forceRedirectUrl="/verify-identity"
              oauthFlow="auto"
              routing="hash"
              signUpUrl="/sign-up"
            />
          )}
        </>
      ) : null}

      {isLoaded && isSignedIn ? (
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
            <Link href="/verify-identity">
              Continue to verification
              <ArrowRight className="ml-auto size-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
