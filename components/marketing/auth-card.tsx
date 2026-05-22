"use client";

import Link from "next/link";
import { SignUp, UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthCard() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="w-full max-w-md">
      {!isLoaded ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <LoaderCircle className="size-5 animate-spin text-[#d8b56d]" />
        </div>
      ) : null}

      {isLoaded && !isSignedIn ? (
        <SignUp
          fallbackRedirectUrl="/verify-identity"
          forceRedirectUrl="/verify-identity"
          oauthFlow="auto"
          routing="hash"
          signInUrl="/sign-in"
        />
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
