import { getClerkProxyUrl } from "@/lib/clerk/proxy-url";

/**
 * Clerk FAPI for production uses frontend API host `clerk.visual-era.vercel.app`,
 * which is not publicly reachable on Vercel. Serve Clerk through same-origin `/__clerk`
 * via middleware `frontendApiProxy` (see middleware.ts).
 *
 * Development instances (pk_test_) use hosted *.clerk.accounts.dev — no proxy.
 */
export const CLERK_SAME_ORIGIN_PROXY_PATH = "/__clerk";

export function getClerkProviderProxyProps(): { proxyUrl?: string } {
  const proxyUrl = getClerkProxyUrl();
  return proxyUrl ? { proxyUrl } : {};
}
