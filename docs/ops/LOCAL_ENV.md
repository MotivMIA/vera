# Local environment — `.env.dev` / `.env.prod`

Use **two gitignored profile files** so dev and production values never fight in one file.

## Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.dev.example` | Yes | Template for local development |
| `.env.prod.example` | Yes | Template for production builds / Vercel import |
| `.env.dev` | No | Real dev secrets — loaded by `npm run dev` |
| `.env.prod` | No | Real prod secrets — loaded by `npm run build` |
| `.env` | No | Legacy single file (still supported as fallback) |

## First-time setup

```bash
cp .env.dev.example .env.dev
cp .env.prod.example .env.prod
# Fill values in both files
npm run env:check
npm run env:check:prod
npm run dev
```

`npm run dev` runs `scripts/with-env.sh dev`, which **sources `.env.dev`** before starting Next.js.

`npm run build` sources **`.env.prod`** (production Clerk keys, `https://visual-era.com`, no `ALLOW_DEV_AUTH_BYPASS`).

### Migrate from an existing `.env`

```bash
npm run env:split
# Creates .env.dev and .env.prod from .env with sensible defaults
```

## Clerk keys

| Variable | `.env.dev` | `.env.prod` |
|----------|------------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV` / `CLERK_SECRET_KEY_DEV` | `pk_test_` / `sk_test_` | optional copy |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD` / `CLERK_SECRET_KEY_PROD` | optional copy | `pk_live_` / `sk_live_` |

Do **not** set `NEXT_PUBLIC_CLERK_PROXY_URL` in `.env.dev` (dev instances use hosted Clerk).

In `.env.prod`, enable proxy for `visual-era.com` when using `pk_live_` — see [CLERK_PROXY_SETUP.md](./CLERK_PROXY_SETUP.md).

Resolution logic: `lib/clerk/keys.ts`.

## Sync with Vercel

**Upload** (local → Vercel):

```bash
npm run vercel:sync-env   # reads .env.prod, then .env
```

**Download** (Vercel → local):

```bash
vercel env pull .env.prod
# Re-apply dev-only overrides in .env.dev:
#   NEXT_PUBLIC_SITE_URL=http://localhost:3001
#   ALLOW_DEV_AUTH_BYPASS=true
```

## Verify

```bash
npm run env:check
npm run env:check:prod
npm run dev:smoke
```

## Cursor agents

- Never commit `.env.dev` / `.env.prod`
- Never paste secrets in chat
- Use `npm run dev` (not raw `next dev`) so the dev profile loads

See [CURSOR_SANDBOX_SETUP.md](./CURSOR_SANDBOX_SETUP.md) · [AGENT_FULL_ACCESS_SETUP.md](./AGENT_FULL_ACCESS_SETUP.md)
