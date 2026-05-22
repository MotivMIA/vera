/**
 * Clerk FAPI for this instance uses frontend API host `clerk.visual-era.vercel.app`,
 * which is not publicly reachable on Vercel. Serve Clerk through same-origin `/__clerk`
 * via middleware `frontendApiProxy` (see middleware.ts).
 */
export const CLERK_SAME_ORIGIN_PROXY_PATH = "/__clerk";

export const CLERK_PROVIDER_PROXY_PROPS = {
  proxyUrl: CLERK_SAME_ORIGIN_PROXY_PATH,
} as const;
