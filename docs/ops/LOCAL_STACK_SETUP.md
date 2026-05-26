# Local stack setup (post-migration)

Restore **Cursor + CLI + ops scripts** on a machine after the move to **Vera-Platforms/vera** and **visual-era.com**.

**Repo:** https://github.com/Vera-Platforms/vera

---

## 1. Git remote

```bash
git remote set-url origin https://github.com/Vera-Platforms/vera.git
export GITHUB_REPO=Vera-Platforms/vera
./scripts/sync-main.sh
```

## 2. Git identity

```bash
git config --global user.name "Visual Era Team"
git config --global --replace-all user.email "admin@visual-era.com"
```

Optional: add and verify `admin@visual-era.com` in GitHub → Settings → Emails.

## 3. Secrets (no 1Password required)

| File | Purpose |
|------|---------|
| **`.cursor/mcp.env`** | API tokens for agents + `./scripts/ops/*` (gitignored) |
| **`.env` / `.env.local`** | App runtime for `npm run dev` (gitignored) |
| **Vercel dashboard** | Production/preview secret **values** |

Bootstrap MCP + example env:

```bash
./scripts/setup-cursor-mcp.sh
# Edit .cursor/mcp.env — see .cursor/mcp.env.example
```

Optional shell profile (do **not** paste the comment line into the terminal):

```bash
# ~/.zshrc
[ -f "$HOME/.config/visual-era/secrets.env" ] && set -a && source "$HOME/.config/visual-era/secrets.env" && set +a
```

## 4. Vercel CLI

```bash
vercel login
vercel link   # project: visual-era
```

Use **OAuth** for CLI; leave `VERCEL_TOKEN` empty in `mcp.env` if it breaks `vercel link`.

Pull env for local dev (optional):

```bash
vercel env pull .env.local
```

## 5. Cursor MCP

1. Run `./scripts/setup-cursor-mcp.sh`
2. **Cursor → Settings → MCP** → connect **GitHub**, **Supabase**, **Vercel**
3. Reload Cursor

Project config: `.cursor/mcp.json` (committed, no secrets).

## 6. Cloudflare

Keep DNS on **Cloudflare** (do not move nameservers to Vercel).

- Token: zone **visual-era.com**, **DNS Edit** only
- Optional in `mcp.env`: `CLOUDFLARE_ZONE_ID` (scripts can auto-resolve)

## 7. Verify everything

```bash
./scripts/ops/run-phase2-verify.sh
./scripts/ops/verify-custom-domain.sh
PRODUCTION_URL=https://visual-era.com ./scripts/production-clerk-proxy-smoke.sh
```

## Dashboard checklist (one-time)

| Service | Action |
|---------|--------|
| **Vercel** | Git → **Vera-Platforms/vera**, `main`; domains Valid; `NEXT_PUBLIC_SITE_URL=https://visual-era.com` |
| **Clerk** | Allowed origin `https://visual-era.com` |
| **Supabase** | Re-authorize GitHub for **Vera-Platforms** (if using Git integration) |

See [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md).
