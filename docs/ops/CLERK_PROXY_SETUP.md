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

---

## If the Dashboard “won’t let you” save the proxy URL

Clerk runs a **validation check** before it enables proxying. Common causes:

| Mistake | Fix |
|---------|-----|
| Wrong Clerk instance (Development) | Switch Dashboard to **Production** (`pk_live_` / `sk_live_`) |
| Wrong URL (`app.visual-era.com`) | Use **`https://visual-era.com/__clerk`** |
| Proxy not deployed yet | Merge `main`, redeploy Vercel Production, retry |

```bash
export CLERK_SECRET_KEY=sk_live_...
./scripts/ops/verify-clerk-proxy.sh
./scripts/ops/configure-clerk-proxy.sh
```

---

## Vercel Production env

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://visual-era.com` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | `https://visual-era.com/__clerk` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |

Do **not** use `pk_test_` / `sk_test_` on Production.

```bash
./scripts/sync-vercel-env.sh
vercel --prod
```

Or individually:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production --value "https://visual-era.com" --yes --force
vercel env add NEXT_PUBLIC_CLERK_PROXY_URL production --value "https://visual-era.com/__clerk" --yes --force
```

Redeploy production after changing env vars.

---

## Local `.env`

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | **omit** when using `pk_test_` (app skips proxy) |

---

## Verify

```bash
npm run smoke:clerk-proxy
```

Must pass **without** `host_invalid`. Hard-refresh https://visual-era.com.
