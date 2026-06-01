import { routing, type AppLocale } from "@/i18n/routing";

/** Read next-intl locale cookie on the client (onboarding routes are outside `[locale]`). */
export function getClientLocaleFromCookie(): AppLocale {
  if (typeof document === "undefined") {
    return routing.defaultLocale;
  }

  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];
  if (value && routing.locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return routing.defaultLocale;
}
