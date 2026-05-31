/** Client-safe Clerk env helpers (NEXT_PUBLIC_* only). */

export function isClerkProductionKeyClient(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  return key.startsWith("pk_live_");
}

export function isClerkProxyForcedClient(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_FORCE_PROXY === "true";
}

/** True when the app configures same-origin /__clerk (pk_live_ or forced proxy). */
export function shouldUseClerkProxyClient(): boolean {
  return isClerkProductionKeyClient() || isClerkProxyForcedClient();
}

export function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}
