"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthCard } from "@/components/marketing/auth-card";

export function SignInView() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="brand-page-glow absolute inset-0" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <BrandLogo size="lg" className="mb-2" />
        <Link
          href="/"
          className="mb-8 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>
        <AuthCard initialMode="sign-in" />
      </div>
    </main>
  );
}
