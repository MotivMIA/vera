"use client";

import Link from "next/link";
import { AuthCard } from "@/components/marketing/auth-card";

export function SignUpView() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0,transparent_36%,rgba(216,181,109,0.08)_100%)]" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <Link
          href="/"
          className="mb-8 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Visual Era
        </Link>
        <AuthCard initialMode="sign-up" signInPresentation="embed" />
      </div>
    </main>
  );
}
