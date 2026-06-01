/**
 * Resolve Clerk API keys when both dev (pk_test_/sk_test_) and prod (pk_live_/sk_live_)
 * are defined in `.env`. Legacy single-key env vars remain supported for Vercel production.
 */

const LOCAL_SITE_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i;

const ENV = {
  SITE_URL: "NEXT_PUBLIC_SITE_URL",
  PUBLISHABLE_KEY: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  PUBLISHABLE_KEY_DEV: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV",
  PUBLISHABLE_KEY_PROD: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD",
  SECRET_KEY: "CLERK_SECRET_KEY",
  SECRET_KEY_DEV: "CLERK_SECRET_KEY_DEV",
  SECRET_KEY_PROD: "CLERK_SECRET_KEY_PROD",
} as const;

/** Bracket access avoids Next.js inlining NEXT_PUBLIC_* to literals in bundled server code. */
function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function writeEnv(name: string, value: string): void {
  // Dynamic key avoids Next bundler rewriting NEXT_PUBLIC_* assignments.
  const key = name;
  process.env[key] = value;
}

export function isClerkDevContext(): boolean {
  if (process.env.NODE_ENV === "development") return true;

  const siteUrl = readEnv(ENV.SITE_URL);
  if (siteUrl && LOCAL_SITE_PATTERN.test(siteUrl)) return true;

  return false;
}

export function hasDualClerkKeys(): boolean {
  return Boolean(
    readEnv(ENV.PUBLISHABLE_KEY_DEV) ||
      readEnv(ENV.PUBLISHABLE_KEY_PROD) ||
      readEnv(ENV.SECRET_KEY_DEV) ||
      readEnv(ENV.SECRET_KEY_PROD),
  );
}

function pickDualKey(devValue: string | undefined, prodValue: string | undefined): string {
  const dev = devValue?.trim() ?? "";
  const prod = prodValue?.trim() ?? "";
  if (!dev && !prod) return "";
  // Prefer dev keys locally, but fall back to prod when dev slots are empty (post env-split).
  return isClerkDevContext() ? dev || prod : prod || dev;
}

export function getClerkPublishableKey(): string {
  const dual = pickDualKey(
    readEnv(ENV.PUBLISHABLE_KEY_DEV) || undefined,
    readEnv(ENV.PUBLISHABLE_KEY_PROD) || undefined,
  );
  if (dual) return dual;

  return readEnv(ENV.PUBLISHABLE_KEY);
}

export function getClerkSecretKey(): string {
  const dual = pickDualKey(
    readEnv(ENV.SECRET_KEY_DEV) || undefined,
    readEnv(ENV.SECRET_KEY_PROD) || undefined,
  );
  if (dual) return dual;

  return readEnv(ENV.SECRET_KEY);
}

/** Apply resolved keys to process.env for Clerk SDK and middleware. */
let loggedDevProdFallback = false;

export function applyResolvedClerkEnv(): void {
  const publishable = getClerkPublishableKey();
  const secret = getClerkSecretKey();

  if (
    !loggedDevProdFallback &&
    isClerkDevContext() &&
    hasDualClerkKeys() &&
    !readEnv(ENV.PUBLISHABLE_KEY_DEV) &&
    readEnv(ENV.PUBLISHABLE_KEY_PROD)
  ) {
    loggedDevProdFallback = true;
    console.warn(
      "[clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV is empty — using *_PROD for local dev. " +
        "Sign-in on localhost needs pk_test_ in .env.dev (Clerk → Development → API Keys).",
    );
  }

  if (publishable) {
    writeEnv(ENV.PUBLISHABLE_KEY, publishable);
  }
  if (secret) {
    writeEnv(ENV.SECRET_KEY, secret);
  }
}

export function isClerkProductionPublishableKey(key?: string): boolean {
  const value = key ?? getClerkPublishableKey();
  return value.startsWith("pk_live_");
}
