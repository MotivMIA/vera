import { defineRouting } from "next-intl/routing";

/**
 * Supported locales. Default locale (en) has no URL prefix (`/`, `/sign-in`).
 * Other locales use a prefix (`/es`, `/it`, `/es/sign-in`). Page components live once
 * under `app/[locale]/` — copy comes from `messages/{locale}.json`, not duplicate pages.
 */
export const routing = defineRouting({
  locales: ["en", "es", "it"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
