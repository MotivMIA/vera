# Vercel deployment — public production

## Public production URL

Use this for users and `NEXT_PUBLIC_SITE_URL`:

**https://visual-era.vercel.app**

| Check | Result |
|-------|--------|
| `/` route | Next.js `app/page.tsx` (HomeHero) |
| `vercel.json` | Not used (App Router defaults) |
| `next.config.ts` | No redirects blocking `/` |

Latest production deployment (example): inspect with `vercel inspect visual-era.vercel.app`.

## Deployment Protection (401 “Authentication Required”)

Vercel **Deployment Protection** / **Vercel Authentication** returns **401** on URLs that require team login.

Typical mistake: opening a **deployment URL** from the Vercel dashboard or GitHub checks:

```text
https://visual-xxxxx-motivmias-projects.vercel.app   ← often 401 when protected
```

**Production aliases** should be public:

```text
https://visual-era.vercel.app                        ← production (public)
https://visual-era-git-main-motivmias-projects.vercel.app
```

**Preview** deployments stay protected (`deploymentType: preview`).

## Fix / re-apply settings

Repo admin with Vercel CLI:

```bash
./scripts/configure-vercel-deployment-protection.sh
```

Or Vercel Dashboard → **visual-era** → **Settings** → **Deployment Protection** → set **Vercel Authentication** to protect **Preview** deployments only (not production deployment URLs).

API equivalent:

```json
{ "ssoProtection": { "deploymentType": "preview" } }
```

To disable all Vercel Authentication (not recommended for previews):

```json
{ "ssoProtection": null }
```

## Clerk auth (same-origin `/__clerk` proxy)

This Clerk instance’s Frontend API host is `clerk.visual-era.vercel.app` (from the publishable key). That host is **not** on Vercel DNS, so the app **must** proxy Clerk through same-origin `/__clerk` (`frontendApiProxy` in `middleware.ts` + `proxyUrl="/__clerk"` on `ClerkProvider`).

**Do not set `NEXT_PUBLIC_CLERK_PROXY_URL` on Vercel** unless you intend a different path.

If you see a handshake loop or `session-token-expired-refresh-non-eligible-no-refresh-cookie`, **clear site data** for `visual-era.vercel.app` (stale `__session` cookies from an older config).

After deploy, verify:

```bash
npm run smoke:clerk-proxy
```

This fails if Clerk JS loads from `clerk.visual-era.vercel.app` (CORS/SSL) instead of `/__clerk/npm/...`.

**Required on Vercel (Production + Preview):**

```text
NEXT_PUBLIC_SITE_URL=https://visual-era.vercel.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

If you previously enabled the `/__clerk` proxy and see a **blank page** or **handshake redirect loop**, remove `NEXT_PUBLIC_CLERK_PROXY_URL` from Vercel env vars, redeploy, then **clear site data** for `visual-era.vercel.app` (stale `__session` cookies cause `session-token-expired-refresh-non-eligible-no-refresh-cookie`).

Middleware redirects any legacy `/__clerk/*` URL to `/` or `/sign-in` so old tabs recover without an infinite loop.

## Clerk vs Vercel 401

| Header / symptom | Cause |
|------------------|--------|
| `x-clerk-auth-status: signed-out` on **200** | Normal for public `/` |
| HTML “Authentication Required”, `_vercel_sso_nonce` cookie | **Vercel** Deployment Protection |
| 401 on API routes | Often Clerk `auth.protect()` on protected routes |

## Domains attached to production

From project settings:

- `visual-era.vercel.app`
- `visual-era-motivmias-projects.vercel.app`
- `visual-era-git-main-motivmias-projects.vercel.app`

Production alias points at the latest successful **Production** deployment (`vercel ls` / `vercel inspect visual-era.vercel.app`).
