/**
 * Visual Era uses Clerk's hosted Frontend API only (no /__clerk FAPI proxy).
 *
 * Clerk 7 auto-enables `/__clerk` on Vercel production when `proxyUrl` is omitted
 * (`getAutoProxyUrlFromEnvironment` in @clerk/shared). A truthy non-path sentinel
 * sets `hasProxyUrl` so auto-proxy is skipped without routing API traffic.
 */
export const CLERK_DISABLE_AUTO_PROXY_SENTINEL = " ";

export const CLERK_HOSTED_PROVIDER_PROPS = {
  proxyUrl: CLERK_DISABLE_AUTO_PROXY_SENTINEL,
} as const;
