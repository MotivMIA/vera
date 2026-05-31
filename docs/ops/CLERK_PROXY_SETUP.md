# Clerk Frontend API proxy — production (required)

Production uses Clerk instance **`clerk.visual-era.vercel.app`** (`pk_live_...`). That host is **not** on public DNS, so auth **must** use a same-origin proxy at **`https://visual-era.com/__clerk`**.

If the proxy is missing, the homepage and `/sign-in` spin forever and `/__clerk/v1/environment` returns **`host_invalid`**.

Cloud agents using **`pk_test_...`** (dev instance) will work **without** this step — that is not the same as production.

---

## 1. Enable proxy in Clerk Dashboard (production instance)

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → switch to **Production** (not Development).
2. **Configure** → **Domains** (or **Frontend API**).
3. **Set proxy configuration** → `https://visual-era.com/__clerk`
4. Save and wait for validation to pass.

Or with the **production** secret key (`sk_live_...`):

```bash
export CLERK_SECRET_KEY=sk_live_...   # production only — never commit
./scripts/ops/configure-clerk-proxy.sh
```

---

## 2. Vercel environment (Production)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://visual-era.com` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | `https://visual-era.com/__clerk` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (production instance) |
| `CLERK_SECRET_KEY` | `sk_live_...` (production instance) |

Do **not** use `pk_test_` / `sk_test_` on Production.

```bash
vercel env add NEXT_PUBLIC_SITE_URL production --value "https://visual-era.com" --yes --force
vercel env add NEXT_PUBLIC_CLERK_PROXY_URL production --value "https://visual-era.com/__clerk" --yes --force
```

Redeploy production after changing env vars.

---

## 3. Verify

```bash
npm run smoke:clerk-proxy
```

Must pass **without** `host_invalid`. Then hard-refresh https://visual-era.com (clear site data if you had a handshake loop).

---

## Local dev

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_CLERK_PROXY_URL` | `http://localhost:3001/__clerk` |

Dev instance (`pk_test_...`) does not need Dashboard proxy for local-only testing.
