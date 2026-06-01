/**
 * Stable public URLs — import from marketing, auth, and onboarding.
 * Keeps path strings out of domain modules to reduce cross-import coupling.
 *
 * Auth/marketing paths are locale-aware (`/sign-in` for en, `/es/sign-in` for es).
 * Use `authSignInPath(locale)` when building hrefs or redirects.
 */
export const AUTH_SIGN_IN_PATH = "/sign-in";
export const AUTH_SIGN_UP_PATH = "/sign-up";
/** App login shell (hero + auth card) — not the public OFM marketing homepage. */
export const APP_LOGIN_PATH = "/login";

import { DEFAULT_LOCALE, pathWithLocale } from "@/lib/i18n/paths";

export { DEFAULT_LOCALE, pathWithLocale };

export function authSignInPath(locale: string = DEFAULT_LOCALE): string {
  return pathWithLocale(locale, AUTH_SIGN_IN_PATH);
}

export function authSignUpPath(locale: string = DEFAULT_LOCALE): string {
  return pathWithLocale(locale, AUTH_SIGN_UP_PATH);
}

export const ONBOARDING_ENTRY_PATH = "/onboarding";
export const ONBOARDING_CONSENT_PATH = "/onboarding/consent";
export const VERIFY_IDENTITY_PATH = "/verify-identity";
export const DOCUMENTS_PATH = "/documents";
export const SUCCESS_PATH = "/success";
