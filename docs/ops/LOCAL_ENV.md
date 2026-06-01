# Local vs live environment files

Two gitignored files — no swapping keys by hand.

| File | Role | Used when |
|------|------|-----------|
| **`.env.local`** | **Local** — localhost, `pk_test_`, dev bypass | `npm run dev` |
| **`.env.production.local`** | **Live** — visual-era.com, `pk_live_`, Clerk proxy | `npm run build`, Vercel sync |

Templates (committed): `.env.local.example` · `.env.production.local.example`

Legacy **`.env`** is optional. If you keep it, run `npm run env:refresh` to copy into local + live.

## Setup

**From scratch:**

```bash
cp .env.local.example .env.local
cp .env.production.local.example .env.production.local
# Paste keys into each file
npm run env:check
npm run env:check:prod
```

**From one recovered `.env`:**

```bash
npm run env:setup        # creates both (fails if they already exist)
npm run env:refresh      # overwrites both from .env
```

## Clerk

| | `.env.local` (local) | `.env.production.local` (live) |
|--|----------------------|--------------------------------|
| Keys | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV` + `CLERK_SECRET_KEY_DEV` (`pk_test_`) | `*_PROD` or legacy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_`) |
| Site URL | `http://localhost:3001` | `https://visual-era.com` |
| Proxy | **off** | optional `/__clerk` on production domain |
| Bypass | `ALLOW_DEV_AUTH_BYPASS=true` | **unset** |

## Commands

```bash
npm run dev              # → .env.local
npm run build            # → .env.production.local
npm run env:check        # validate local file
npm run env:check:prod   # validate live file
npm run vercel:sync-env  # push from live file
```

## Migrate old names

```bash
npm run env:migrate   # .env.dev → .env.local, .env.prod → .env.production.local
```
