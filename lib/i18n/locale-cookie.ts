import { routing, type AppLocale } from "@/i18n/routing";

/** next-intl locale cookie (must match middleware / `getPreferredLocale`). */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 31536000;

export function formatLocaleCookieHeader(locale: string): string {
  return `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}

/** Persist locale before navigation so middleware does not restore a stale cookie. */
export function setClientLocaleCookie(locale: AppLocale): void {
  if (typeof document === "undefined") {
    return;
  }
  if (!routing.locales.includes(locale)) {
    return;
  }
  document.cookie = formatLocaleCookieHeader(locale);
}
