"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/marketing/auth-card";
import { HomeBranding } from "@/components/marketing/home-branding";
import { MarketingAuthAmbientArt } from "@/components/marketing/marketing-art";
import { MarketingPhoto } from "@/components/marketing/marketing-photo";
import { Link } from "@/i18n/navigation";
import { authCardWidthClass, heroGridClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type AppAuthShellProps = {
  /** Show “back to home” above branding on small screens only. */
  showMobileBackLink?: boolean;
};

export function AppAuthShell({ showMobileBackLink = false }: AppAuthShellProps) {
  const t = useTranslations("Auth.signInView");

  return (
    <main className="relative isolate flex min-h-screen flex-1 flex-col overflow-x-hidden">
      <div className="brand-page-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div
        className={cn(
          heroGridClass,
          "w-full min-h-screen items-center py-section lg:min-h-[calc(100vh-var(--hero-min-height-offset))]",
        )}
      >
        <section className="relative flex w-full min-w-0 flex-col items-start justify-center pb-4 pt-5 lg:pb-0 lg:pt-0">
          {/* Full-column ambient — no rounded panel; branding stays open layout */}
          <div
            className="pointer-events-none absolute inset-y-0 -left-fluid-inline right-0 z-0 hidden lg:block"
            aria-hidden
          >
            <MarketingAuthAmbientArt className="absolute inset-0 bg-transparent" />
            <MarketingPhoto
              src="/marketing/auth-ambient.avif"
              alt=""
              className="absolute inset-0"
              imgClassName="opacity-[0.32] mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/55 to-transparent" />
          </div>

          {showMobileBackLink ? (
            <Link
              href="/"
              className="relative z-[1] mb-4 text-fluid-small font-medium text-muted-foreground transition hover:text-foreground lg:hidden"
            >
              {t("backHome")}
            </Link>
          ) : null}
          <HomeBranding variant="compact" className="relative z-[1] lg:hidden" />
          <HomeBranding className="relative z-[1] hidden lg:block" />
        </section>

        <section className="relative z-[1] flex min-h-0 w-full min-w-0 flex-col items-center justify-center pb-8 lg:pb-0">
          <motion.div
            className={authCardWidthClass}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthCard />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
