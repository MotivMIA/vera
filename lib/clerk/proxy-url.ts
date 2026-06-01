/**
 * Absolute Frontend API proxy URL (production / pk_live_ only).
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
 *
 * Clerk development instances (pk_test_, e.g. immense-sawfish-81) use hosted
 * *.clerk.accounts.dev — proxying is not supported; do not set proxyUrl.
 */
const PRODUCTION_PROXY_URL = "https://visual-era.com/__clerk";

const LOCAL_SITE_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;

function normalizeProxyUrl(value: string): string | null {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }
  // Reject copy-paste mistakes like NEXT_PUBLIC_CLERK_PROXY_URL=https://...
  if (trimmed.includes("NEXT_PUBLIC_") || trimmed.includes("=")) {
    return null;
  }
  return trimmed;
}

import { getClerkPublishableKey, isClerkProductionPublishableKey } from "@/lib/clerk/keys";

/** Production Clerk keys require same-origin /__clerk when FAPI is not on public DNS. */
export function isClerkProductionKey(): boolean {
  return isClerkProductionPublishableKey(getClerkPublishableKey());
}

/** Opt-in: test proxy against a dev instance (usually fails — Clerk blocks dev proxy). */
export function isClerkProxyForced(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_FORCE_PROXY === "true";
}

export function shouldUseClerkFrontendApiProxy(): boolean {
  return isClerkProductionKey() || isClerkProxyForced();
}

/** True when NEXT_PUBLIC_SITE_URL points at this machine (npm run dev). */
export function isLocalSiteUrl(siteUrl?: string): boolean {
  const url = (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  return LOCAL_SITE_PATTERN.test(url);
}

function resolveClerkProxyUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  const normalizedExplicit = explicit ? normalizeProxyUrl(explicit) : null;
  if (normalizedExplicit) {
    return normalizedExplicit;
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

  return PRODUCTION_PROXY_URL;
}

/** Proxy URL for ClerkProvider / handshake, or `null` when using a dev instance without proxy. */
export function getClerkProxyUrl(): string | null {
  if (!shouldUseClerkFrontendApiProxy()) {
    return null;
  }
  // pk_live_ + localhost proxy breaks Clerk JS (blank page). Use pk_test_ locally instead.
  if (isLocalSiteUrl()) {
    return null;
  }
  return resolveClerkProxyUrl();
}
