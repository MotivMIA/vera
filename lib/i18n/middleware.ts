/**
 * Paths that stay unprefixed (onboarding, dashboard, API).
 * Marketing/auth/legal use `/[locale]/…` via next-intl middleware.
 */
const NON_LOCALIZED_PREFIXES = [
  "/api",
  "/onboarding",
  "/verify-identity",
  "/documents",
  "/success",
  "/creator",
  "/admin",
  "/chatter",
  "/__clerk",
] as const;

export function shouldLocalizePathname(pathname: string): boolean {
  return !NON_LOCALIZED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
