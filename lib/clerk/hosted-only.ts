/**
 * Clerk FAPI for this instance uses frontend API host `clerk.visual-era.vercel.app`,
 * which is not publicly reachable on Vercel. Serve Clerk through same-origin `/__clerk`
 * via middleware `frontendApiProxy` (see middleware.ts).
 *
 * In development, the FAPI host (*.clerk.accounts.dev) is publicly accessible,
 * so the proxy is not needed and requires dashboard configuration that is only
 * available on production Clerk instances.
 */
export const CLERK_SAME_ORIGIN_PROXY_PATH = "/__clerk";

const isProduction = process.env.NODE_ENV === "production";

export const CLERK_PROVIDER_PROXY_PROPS = isProduction
  ? ({ proxyUrl: CLERK_SAME_ORIGIN_PROXY_PATH } as const)
  : ({} as const);
