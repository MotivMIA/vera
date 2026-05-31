# Local environment — single `.env` workflow

Use **one gitignored file** (`.env`) for local dev and for bulk import into Vercel.

## Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | Yes | Template — every key name, no secrets |
| `.env` | No (gitignored) | Your real values; import this into Vercel |
| `.cursor/mcp.env.example` | Yes | Template for Cursor MCP tokens only |
| `.cursor/mcp.env` | No | GitHub MCP PAT, etc. — not app keys |

You do **not** need `.env.local` unless you want overrides. Next.js loads `.env` in development.

## First-time setup

```bash
cp .env.example .env
# Fill values in .env (Clerk, Supabase, Didit, …)
./scripts/check-local-env.sh
npm run dev
```

Default dev URL: **http://localhost:3001** (`NEXT_PUBLIC_SITE_URL` must match).

## Sync with Vercel

**Download** (Vercel → local):

```bash
vercel env pull .env
# Then re-apply local-only overrides:
#   NEXT_PUBLIC_SITE_URL=http://localhost:3001
#   ALLOW_DEV_AUTH_BYPASS=true
```

**Upload** (local → Vercel):

- **CLI:** `npm run vercel:sync-env` (adds missing keys from `.env`; never prints values)
- **Dashboard:** Project → Settings → Environment Variables → **Import .env**

Requires `vercel login` and `vercel link --yes --project visual-era`.

After import, set in Vercel **Production** (not in local `.env` for prod):

- `NEXT_PUBLIC_SITE_URL=https://visual-era.com`
- Do **not** set `ALLOW_DEV_AUTH_BYPASS` on Production

## Local-only keys

| Key | Local | Production |
|-----|-------|------------|
| `ALLOW_DEV_AUTH_BYPASS` | `true` (optional) | **unset** |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` | `https://visual-era.com` |

## Cursor agent automation

1. Open `~/Documents/projects/visual-era` in Cursor.
2. **Settings → Agents → Auto-Run:** Allowlist (with Sandbox).
3. Copy `.cursor/mcp.env.example` → `.cursor/mcp.env` if using GitHub/Supabase/Vercel MCP.
4. Tell the agent: keys are in `.env` — never paste secrets in chat.

See [CURSOR_SANDBOX_SETUP.md](./CURSOR_SANDBOX_SETUP.md) · [LOCAL_WORKSPACE_STRATEGY.md](./LOCAL_WORKSPACE_STRATEGY.md)

## Verify

```bash
./scripts/check-local-env.sh
npm run dev:smoke
```
