import { routing, type AppLocale } from "@/i18n/routing";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";

/** Read next-intl locale cookie on the client (onboarding routes are outside `[locale]`). */
export function getClientLocaleFromCookie(): AppLocale {
  if (typeof document === "undefined") {
    return routing.defaultLocale;
  }

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  if (value && routing.locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return routing.defaultLocale;
}
