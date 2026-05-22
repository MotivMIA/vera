/**
 * Visual Era uses Clerk's hosted Frontend API only (no /__clerk FAPI proxy).
 * Do not set NEXT_PUBLIC_CLERK_PROXY_URL in Vercel or local env.
 */
export const CLERK_HOSTED_PROVIDER_PROPS = {
  proxyUrl: undefined,
} as const;
