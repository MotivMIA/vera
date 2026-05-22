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

## Clerk Frontend API proxy

Production uses Clerk’s **middleware** `frontendApiProxy` (path `/__clerk`). The browser must load Clerk JS through that proxy with an **absolute** URL.

**Required on Vercel (Production + Preview):**

```text
NEXT_PUBLIC_SITE_URL=https://visual-era.vercel.app
NEXT_PUBLIC_CLERK_PROXY_URL=https://visual-era.vercel.app/__clerk
```

Without `NEXT_PUBLIC_CLERK_PROXY_URL`, you may see:

- **404** on `/__clerk/npm/@clerk/clerk-js@6/dist/clerk.browser.js`
- **307 loop** on `/__clerk/v1/client/handshake` with nested `redirect_url`
- `session-token-expired-refresh-non-eligible-no-refresh-cookie` until cookies are cleared after a fix

After deploying a proxy fix, hard-refresh or clear site data for `visual-era.vercel.app`.

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
