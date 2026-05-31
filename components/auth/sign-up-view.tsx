"use client";

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { ONBOARDING_ENTRY_PATH } from "@/lib/onboarding/constants";

export function SignUpView() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground">
          Visual Era
        </Link>
        <ClerkLoading>
          <div className="flex min-h-[520px] items-center justify-center">
            <LoaderCircle className="size-8 animate-spin text-accent" />
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl={ONBOARDING_ENTRY_PATH}
            forceRedirectUrl={ONBOARDING_ENTRY_PATH}
          />
        </ClerkLoaded>
      </div>
    </main>
  );
}
