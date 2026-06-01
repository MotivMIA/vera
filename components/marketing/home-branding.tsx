"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  fluidBlockGapClass,
  fluidBodyClass,
  fluidCompactMottoClass,
  fluidMottoH1Class,
  mottoWrapClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

/** Narrow no-break after comma so the motto does not break right after punctuation. */
function mottoDisplay(title: string): string {
  return title.replace(/,\s+/g, ",\u00a0");
}

export type HomeBrandingProps = {
  className?: string;
  /** `compact` — auth/mobile: lockup + headline only; `full` — homepage hero block. */
  variant?: "full" | "compact";
};

export function HomeBranding({ className, variant = "full" }: HomeBrandingProps) {
  const t = useTranslations("HomeBranding");

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={cn("w-full min-w-0 space-y-fluid-gap-md", className)}
      >
        <Link href="/" className="inline-flex rounded-lg transition-opacity hover:opacity-90">
          <BrandLogo size="xl" showWordmark priority />
        </Link>
        <div className={mottoWrapClass}>
          <h1 className={cn(fluidCompactMottoClass, "text-left")}>
            {mottoDisplay(t("title"))}
          </h1>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(fluidBlockGapClass, "w-full min-w-0", className)}
    >
      <Link href="/" className="mx-auto inline-flex rounded-lg transition-opacity hover:opacity-90 lg:mx-0">
        <BrandLogo size="lg" showWordmark priority className="brand-logo-lockup--hero" />
      </Link>
      <Badge className="mx-auto w-fit gap-2 border-border-accent-strong bg-surface-accent-muted text-accent lg:mx-0">
        <Sparkles className="size-3" />
        {t("badge")}
      </Badge>
      <div className="mx-auto max-w-md space-y-fluid-gap-sm text-center lg:mx-0 lg:max-w-none lg:space-y-fluid-gap-md lg:text-left">
        <div className={mottoWrapClass}>
          <h1 className={fluidMottoH1Class}>{mottoDisplay(t("title"))}</h1>
        </div>
        <p className={cn(fluidBodyClass, "lg:max-w-2xl")}>{t("description")}</p>
      </div>
    </motion.div>
  );
}
