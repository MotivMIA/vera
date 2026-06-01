"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/marketing/auth-card";
import { HomeBranding } from "@/components/marketing/home-branding";
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
    <main className="relative flex min-h-screen flex-1 overflow-hidden lg:min-h-full">
      <div className="brand-page-glow absolute inset-0" aria-hidden />
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div
        className={cn(
          heroGridClass,
          "min-h-screen content-center lg:min-h-[calc(100vh-var(--hero-min-height-offset))]",
        )}
      >
        <section className="flex w-full flex-col items-start justify-center pb-4 pt-5 lg:pb-0 lg:pt-0">
          {showMobileBackLink ? (
            <Link
              href="/"
              className="mb-4 text-fluid-small font-medium text-muted-foreground transition hover:text-foreground lg:hidden"
            >
              {t("backHome")}
            </Link>
          ) : null}
          <HomeBranding variant="compact" className="lg:hidden" />
          <HomeBranding className="hidden lg:block" />
        </section>

        <section className="flex flex-col items-center justify-center pb-8 lg:pb-0 lg:pt-0">
          <motion.div
            className={authCardWidthClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <AuthCard />
          </motion.div>
        </section>
      </div>
    </main>
  );
}
