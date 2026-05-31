# Clerk Frontend API proxy — production (required)

Production uses **`pk_live_...`** with Frontend API host **`clerk.visual-era.vercel.app`**. That hostname is **not on public DNS**, so auth must use a same-origin proxy at:

```text
https://visual-era.com/__clerk
```

(not `https://app.visual-era.com/__clerk` unless that subdomain exists on Vercel)

Until Clerk accepts this proxy, `/__clerk/v1/environment` returns **`host_invalid`** and the sign-in UI spins forever.

**Cloud / local dev** uses **`pk_test_...`** (`*.clerk.accounts.dev`) — that works **without** Dashboard proxy setup. That is a different Clerk instance than production.

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
