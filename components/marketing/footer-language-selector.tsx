"use client";

import { useTranslations } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { LOCALE_LABELS } from "@/lib/i18n/locales";
import { useSwitchLocale } from "@/lib/i18n/use-switch-locale";
import { cn } from "@/lib/utils";

export function FooterLanguageSelector({ className }: { className?: string }) {
  const t = useTranslations("Footer");
  const { locale, switchLocaleHard } = useSwitchLocale();

  return (
    <select
      id="footer-language"
      name="language"
      aria-label={t("languageLabel")}
      value={locale}
      onChange={(event) => {
        const nextLocale = event.target.value as AppLocale;
        if (!routing.locales.includes(nextLocale)) return;
        switchLocaleHard(nextLocale);
      }}
      className={cn(
        "h-6 max-w-[6.5rem] cursor-pointer appearance-none rounded border-0 bg-transparent",
        "py-0 pl-0 pr-5 text-xs text-muted-foreground",
        "bg-[length:0.65rem] bg-[right_0_center] bg-no-repeat",
        "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239da3af%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/30",
        className,
      )}
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
