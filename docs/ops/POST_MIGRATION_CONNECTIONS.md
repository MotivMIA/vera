# Post-migration connections reset

After moving to **Vera-Platforms/vera** and enabling **visual-era.com**.

**Repo:** https://github.com/Vera-Platforms/vera  
**Local setup:** [LOCAL_STACK_SETUP.md](./LOCAL_STACK_SETUP.md)

---

## Completed (infra)

| Item | Status |
|------|--------|
| GitHub default repo `Vera-Platforms/vera` | Done |
| Production URL `https://visual-era.com` | Done |
| Cloudflare DNS → Vercel (apex + www) | Done |
| Custom domain HTTP 200 | Done |
| Vercel production env keys | Done |
| Resend domain `visual-era.com` | Done |
| Phase 2 ops scripts + `.cursor/mcp.env` loader | Done |
| Cursor MCP config (`.cursor/mcp.json`) | Done |

---

## Confirm in dashboards (if not already)

### Vercel

- **Git** → repository **`Vera-Platforms/vera`**, branch **`main`**
- **Domains** → `visual-era.com` + `www` **Valid** (keep DNS on Cloudflare — ignore “update nameservers”)
- **Env** → `NEXT_PUBLIC_SITE_URL=https://visual-era.com`

### Clerk

- Allowed origins: `https://visual-era.com` (+ `https://visual-era.vercel.app` during transition)

### Supabase / Cursor / Codex

- Re-authorize GitHub for **Vera-Platforms** org where applicable

### GitHub

- Optional: verify `admin@visual-era.com` in Settings → Emails
- Branch protection on private org repo (UI or Pro) if `setup-github-branch-protection.sh` 403s

---

## Local machine (new checkout)

```bash
git remote set-url origin https://github.com/Vera-Platforms/vera.git
export GITHUB_REPO=Vera-Platforms/vera
./scripts/setup-cursor-mcp.sh
# fill .cursor/mcp.env
./scripts/sync-main.sh
./scripts/ops/run-phase2-verify.sh
```

---

## Verification commands

```bash
./scripts/check-github-owner-refs.sh
GITHUB_REPO=Vera-Platforms/vera ./scripts/audit-github-repo-settings.sh
./scripts/ops/verify-custom-domain.sh
./scripts/ops/run-phase2-verify.sh
PRODUCTION_URL=https://visual-era.com ./scripts/production-clerk-proxy-smoke.sh
```

---

## Rollback

- GitHub: old URL redirects to Vera-Platforms/vera — do not delete
- Domain: remove custom domain in Vercel; use `visual-era.vercel.app` only
- Env: revert `NEXT_PUBLIC_SITE_URL` to Vercel URL
