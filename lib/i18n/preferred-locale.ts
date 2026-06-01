import { cookies } from "next/headers";
import { routing, type AppLocale } from "@/i18n/routing";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";

/** Locale from next-intl cookie, else default (`en`). */
export async function getPreferredLocale(): Promise<AppLocale> {
  const value = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  if (value && routing.locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return routing.defaultLocale;
}
