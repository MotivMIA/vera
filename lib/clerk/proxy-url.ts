/**
 * Absolute Frontend API proxy URL (required for production + Clerk JS in the browser).
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
 */
const LOCAL_PROXY_URL = "http://localhost:3001/__clerk";
const PRODUCTION_PROXY_URL = "https://visual-era.com/__clerk";

export function getClerkProxyUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl?.startsWith("http")) {
    return `${siteUrl.replace(/\/$/, "")}/__clerk`;
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_PROXY_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/__clerk`;
  }

  return LOCAL_PROXY_URL;
}
