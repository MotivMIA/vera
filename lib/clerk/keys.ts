/**
 * Resolve Clerk API keys when both dev (pk_test_/sk_test_) and prod (pk_live_/sk_live_)
 * are defined in `.env`. Legacy single-key env vars remain supported for Vercel production.
 */

const LOCAL_SITE_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;

export function isClerkDevContext(): boolean {
  if (process.env.NODE_ENV === "development") return true;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (siteUrl && LOCAL_SITE_PATTERN.test(siteUrl)) return true;

  return false;
}

export function hasDualClerkKeys(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV?.trim() ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD?.trim() ||
      process.env.CLERK_SECRET_KEY_DEV?.trim() ||
      process.env.CLERK_SECRET_KEY_PROD?.trim(),
  );
}

function pickDualKey(devValue: string | undefined, prodValue: string | undefined): string {
  const dev = devValue?.trim() ?? "";
  const prod = prodValue?.trim() ?? "";
  if (!dev && !prod) return "";
  return isClerkDevContext() ? dev : prod;
}

export function getClerkPublishableKey(): string {
  const dual = pickDualKey(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV,
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD,
  );
  if (dual) return dual;

  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";
}

export function getClerkSecretKey(): string {
  const dual = pickDualKey(process.env.CLERK_SECRET_KEY_DEV, process.env.CLERK_SECRET_KEY_PROD);
  if (dual) return dual;

  return process.env.CLERK_SECRET_KEY?.trim() ?? "";
}

/** Apply resolved keys to process.env for Clerk SDK and middleware. */
export function applyResolvedClerkEnv(): void {
  const publishable = getClerkPublishableKey();
  const secret = getClerkSecretKey();

  if (publishable) {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishable;
  }
  if (secret) {
    process.env.CLERK_SECRET_KEY = secret;
  }
}

export function isClerkProductionPublishableKey(key?: string): boolean {
  const value = key ?? getClerkPublishableKey();
  return value.startsWith("pk_live_");
}
