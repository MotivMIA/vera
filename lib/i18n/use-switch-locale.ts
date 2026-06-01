"use client";

import { useCallback, useTransition } from "react";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname as useIntlPathname, useRouter } from "@/i18n/navigation";
import { getClientLocaleFromCookie } from "@/lib/i18n/client-locale";
import { setClientLocaleCookie } from "@/lib/i18n/locale-cookie";
import { pathWithLocale, stripLocalePrefix } from "@/lib/i18n/paths";
import { routing, type AppLocale } from "@/i18n/routing";

const UNPREFIXED_ROUTE_PREFIXES = [
  "/onboarding",
  "/verify-identity",
  "/documents",
  "/success",
  "/creator",
  "/admin",
  "/chatter",
] as const;

function isUnprefixedAppPath(pathname: string): boolean {
  return UNPREFIXED_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Switch locale while staying on the same page. Refreshes RSC so server
 * translations and NextIntlClientProvider messages update.
 */
export function useSwitchLocale() {
  const intlLocale = useLocale() as AppLocale;
  const locale =
    intlLocale && routing.locales.includes(intlLocale) ? intlLocale : getClientLocaleFromCookie();
  const intlPathname = useIntlPathname();
  const nextPathname = useNextPathname();
  const pathname = isUnprefixedAppPath(nextPathname)
    ? nextPathname
    : intlPathname || stripLocalePrefix(nextPathname);
  const intlRouter = useRouter();
  const nextRouter = useNextRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (nextLocale: AppLocale) => {
      if (!routing.locales.includes(nextLocale) || nextLocale === locale) {
        return;
      }

      if (isUnprefixedAppPath(pathname)) {
        setClientLocaleCookie(nextLocale);
        startTransition(() => {
          nextRouter.refresh();
        });
        return;
      }

      setClientLocaleCookie(nextLocale);
      startTransition(() => {
        intlRouter.replace(pathname, { locale: nextLocale });
        nextRouter.refresh();
      });
    },
    [intlRouter, locale, nextRouter, pathname],
  );

  /** Full navigation — use if soft navigation leaves stale copy. */
  const switchLocaleHard = useCallback(
    (nextLocale: AppLocale) => {
      if (!routing.locales.includes(nextLocale) || nextLocale === locale) {
        return;
      }

      if (isUnprefixedAppPath(pathname)) {
        setClientLocaleCookie(nextLocale);
        window.location.reload();
        return;
      }

      setClientLocaleCookie(nextLocale);
      window.location.assign(pathWithLocale(nextLocale, pathname));
    },
    [locale, pathname],
  );

  return { locale, switchLocale, switchLocaleHard, isPending };
}
