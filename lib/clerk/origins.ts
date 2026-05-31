/**
 * Origins allowed for Clerk session cookies and redirect validation.
 * Always include canonical production hosts — not only NEXT_PUBLIC_SITE_URL —
 * so custom-domain traffic works when Vercel env still points at *.vercel.app.
 */
const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
] as const;

const CANONICAL_PRODUCTION_ORIGINS = [
  "https://visual-era.com",
  "https://www.visual-era.com",
  "https://visual-era.vercel.app",
] as const;

function addOriginFromUrl(origins: Set<string>, value?: string | null) {
  if (!value?.trim()) return;

  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    origins.add(new URL(normalized).origin);
  } catch {
    // ignore malformed values
  }
}

export function collectClerkOrigins(): string[] {
  const origins = new Set<string>([...LOCAL_DEV_ORIGINS, ...CANONICAL_PRODUCTION_ORIGINS]);

  addOriginFromUrl(origins, process.env.NEXT_PUBLIC_SITE_URL);
  addOriginFromUrl(origins, process.env.VERCEL_URL);
  addOriginFromUrl(origins, process.env.VERCEL_BRANCH_URL);

  return Array.from(origins);
}
