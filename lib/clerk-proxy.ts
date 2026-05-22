import { getSiteUrl } from "@/lib/env";

const PROXY_PATH = "/__clerk";

/**
 * Absolute Frontend API proxy URL for Clerk JS and handshake.
 * Prefer NEXT_PUBLIC_CLERK_PROXY_URL in production (Vercel); otherwise derive from site URL.
 */
export function getClerkProxyUrl(preferredOrigin?: string | null): string {
  const configured = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  const siteOrigin = getSiteUrl(preferredOrigin).replace(/\/$/, "");

  if (configured) {
    if (configured.startsWith("http://") || configured.startsWith("https://")) {
      return configured.replace(/\/$/, "");
    }
    const path = configured.startsWith("/") ? configured : `/${configured}`;
    return `${siteOrigin}${path}`.replace(/\/$/, "");
  }

  return `${siteOrigin}${PROXY_PATH}`;
}
