# Local environment — `.env.local` (Next.js native)

Use **Next.js standard env files** so `npm run dev` loads secrets without wrapper scripts.

## Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.local.example` | Yes | Template for local development |
| `.env.production.local.example` | Yes | Template for local `npm run build` / Vercel import |
| `.env.local` | No | Dev secrets — **auto-loaded** by `next dev` |
| `.env.production.local` | No | Prod secrets for local builds — auto-loaded by `next build` |
| `.env` | No | Legacy single file (still supported by `env:check`) |

## First-time setup

```bash
cp .env.local.example .env.local
cp .env.production.local.example .env.production.local
# Fill values
npm run env:check
npm run dev
```

### Migrate from `.env.dev` / `.env.prod`

```bash
npm run env:migrate
```

Or from a single `.env`:

```bash
npm run env:split
```

## Clerk keys

| Variable | `.env.local` | `.env.production.local` |
|----------|--------------|-------------------------|
| `*_DEV` | `pk_test_` / `sk_test_` | optional |
| `*_PROD` | optional fallback | `pk_live_` / `sk_live_` |

Do **not** set `NEXT_PUBLIC_CLERK_PROXY_URL` in `.env.local`.

Production proxy: see [CLERK_PROXY_SETUP.md](./CLERK_PROXY_SETUP.md).

## Commands

| Command | Env file |
|---------|----------|
| `npm run dev` | `.env.local` (+ `.env.development*` if present) |
| `npm run build` | `.env.production.local`, `.env.production`, `.env` |
| `npm run env:check` | `.env.local` (falls back to `.env.dev`, `.env`) |
| `npm run env:check:prod` | `.env.production.local` (falls back to `.env.prod`, `.env`) |

## Vercel

```bash
npm run vercel:sync-env   # reads .env.production.local, then legacy paths
vercel env pull .env.production.local
```

Production on Vercel uses dashboard env vars — not your local files.

## Verify

```bash
npm run env:check
npm run dev:smoke
```
