# Clerk Frontend API proxy — production (required)

Production uses **`pk_live_...`** with Frontend API host **`clerk.visual-era.vercel.app`**. That hostname is **not on public DNS**, so auth must use a same-origin proxy at:

```text
https://visual-era.com/__clerk
```

(not `https://app.visual-era.com/__clerk` unless that subdomain exists on Vercel)

Until Clerk accepts this proxy, `/__clerk/v1/environment` returns **`host_invalid`** and the sign-in UI spins forever.

**Local / cloud dev** uses **`pk_test_...`** (e.g. instance **immense-sawfish-81**) with hosted Frontend API on **`*.clerk.accounts.dev`**.

| Instance | Proxy (`/__clerk` + Dashboard) |
|----------|--------------------------------|
| **Production** (`pk_live_`) | **Required** — register `visual-era.com` + proxy URL (see below) |
| **Development** (`pk_test_`) | **Not supported** by Clerk — do **not** set `NEXT_PUBLIC_CLERK_PROXY_URL`; the app skips `proxyUrl` automatically |

Clerk docs: [proxying does not work for development instances](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi). If auth spins locally with `pk_test_`, remove `NEXT_PUBLIC_CLERK_PROXY_URL` from `.env` and restart `npm run dev`.

To test production-style proxy locally (rare), use `pk_live_` **and** Dashboard proxy config — prefer testing on https://visual-era.com instead.

---

## Root cause checklist (when everything “looks configured” but auth still spins)

Two separate issues often stack:

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Vercel alias missing** | `https://visual-era.vercel.app` → `DEPLOYMENT_NOT_FOUND`; Clerk proxy check fails for `*.vercel.app/__clerk` | Vercel project → **Domains** → add `visual-era.vercel.app` to the live `visual-era` project |
| **Clerk domain ≠ browser host** | `GET https://visual-era.com/__clerk/v1/environment` → `host_invalid`; API `PATCH proxy_url` to `.com` on a `*.vercel.app` domain → **422** “Cannot be on a different domain” | Add a Clerk **domain** named `visual-era.com` with `proxy_url` `https://visual-era.com/__clerk` (see script below). Do not only set Vercel env vars. |

After both are fixed:

```bash
export CLERK_SECRET_KEY=sk_live_...   # from Vercel Production — never paste in chat
./scripts/ops/verify-clerk-proxy.sh
curl -sS -H "Origin: https://visual-era.com" "https://visual-era.com/__clerk/v1/environment" | head -c 120
# Should show "auth_config", not "host_invalid"
```

Then hard-refresh https://visual-era.com (or clear site data for stale `__session` cookies).

Optional: Clerk may list **email DNS** (`clkmail`, `clk._domainkey`) for `visual-era.com` — add those in your DNS when you want branded auth email; proxy auth works without them.

---

## Dashboard shows `visual-era.vercel.app` and won’t let you change it

That is **expected** when Clerk was provisioned through the **Vercel integration**.

| Domain in Clerk | Editable? | Role |
|-----------------|-----------|------|
| **`visual-era.vercel.app`** | **No** — `is_provider_domain` (Vercel-managed) | Legacy integration hostname; `pk_live_` still encodes `clerk.visual-era.vercel.app` internally |
| **`visual-era.com`** | Yes (proxy URL, paths, email DNS) | **Canonical production** — users hit this; proxy `https://visual-era.com/__clerk` |

You do **not** need to rename or delete the `.vercel.app` row. Production auth on https://visual-era.com uses the **`visual-era.com`** domain record.

In **Clerk Dashboard → Configure → Domains**, you should see **both** entries. Open **`visual-era.com`** (not the Vercel provider row) to edit proxy, home URL, and optional DNS.

To change the **primary** label in the UI from `.vercel.app` to `.com` only: Clerk may require [adding a custom production domain](https://clerk.com/docs/guides/development/deployment/production) or support — the API returns `provider_domain_operation_not_allowed` if you try to PATCH the Vercel domain name.

---

## If the Dashboard “won’t let you” save the proxy URL

Clerk runs a **validation check** before it enables proxying. If the check fails, the UI blocks save. Common causes:

| Mistake | Fix |
|---------|-----|
| Wrong Clerk instance (Development) | Switch Dashboard to **Production** (keys start with `pk_live_` / `sk_live_`) |
| Wrong URL (`app.visual-era.com`) | Use **`https://visual-era.com/__clerk`** |
| Using `sk_test_` in scripts | Copy **`sk_live_`** from Vercel Production env (never paste secrets in chat) |
| Proxy not deployed yet | Merge latest `main`, redeploy Vercel Production, then retry |

### Option 1 — API (bypasses the Dashboard form)

On your machine:

```bash
# Copy sk_live_ from Vercel → visual-era → Settings → Environment Variables → Production
export CLERK_SECRET_KEY=sk_live_...

./scripts/ops/verify-clerk-proxy.sh
./scripts/ops/configure-clerk-proxy.sh
```

Then redeploy production on Vercel.

### Option 2 — Clerk Support

If `verify-clerk-proxy.sh` fails, email **support@clerk.com** with:

- Instance Frontend API: `clerk.visual-era.vercel.app`
- Desired proxy URL: `https://visual-era.com/__clerk`
- Error: `host_invalid` on `GET /__clerk/v1/environment`

Ask them to enable **`proxy_url`** on your production domain or advise CNAME setup for `visual-era.com`.

### Option 3 — Temporary unblock (dev keys on Production only)

Only for internal testing: set Vercel **Production** Clerk vars to your **development** `pk_test_` / `sk_test_` (same as local `.env`). Auth will work without proxy, but this is **not** a real production auth instance — switch back to `pk_live_` before launch.

---

## Vercel Production env

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://visual-era.com` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | `https://visual-era.com/__clerk` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |

```bash
./scripts/sync-vercel-env.sh
vercel --prod
```

---

## Local `.env`

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PROXY_URL=http://localhost:3001/__clerk
```

Do **not** duplicate the variable name on one line (`NEXT_PUBLIC_CLERK_PROXY_URL=NEXT_PUBLIC_...`).

---

## Verify

```bash
npm run smoke:clerk-proxy
curl -sS -H "Origin: https://visual-era.com" "https://visual-era.com/__clerk/v1/environment" | head -c 200
```

Success = JSON **without** `"code":"host_invalid"`. Then hard-refresh https://visual-era.com.
