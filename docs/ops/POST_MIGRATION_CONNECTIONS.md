# Post-migration connections reset

After moving to **Vera-Platforms/vera** and enabling **visual-era.com**.

**Repo:** https://github.com/Vera-Platforms/vera

---

## Automated in repo (PR)

| Item | Status |
|------|--------|
| `scripts/lib/github-repo.sh` default `Vera-Platforms/vera` | Done in PR |
| Agent scripts use canonical repo slug | Done in PR |
| Docs: GitHub URLs → Vera-Platforms | Done in PR |
| Production URL docs → `https://visual-era.com` | Done in PR |
| Vercel domains `visual-era.com` + `www` added | Done (CLI) |
| `docs/ops/CUSTOM_DOMAIN_SETUP.md` | Done |

---

## You must complete (dashboard)

### 1. Cloudflare DNS → Vercel

See [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md):

- Apex **A** → `76.76.21.21`
- **www** CNAME → `cname.vercel-dns.com`

### 2. Vercel Git → new org

Vercel Dashboard → **visual-era** → **Settings** → **Git**:

- Connect repository **`Vera-Platforms/vera`**
- Production branch: **`main`**
- Install Vercel GitHub App on **Vera-Platforms** org

### 3. Vercel env

Set **Production** (and Preview if needed):

```text
NEXT_PUBLIC_SITE_URL=https://visual-era.com
```

Redeploy production.

### 4. Clerk

- Allowed origins: `https://visual-era.com` (+ keep `visual-era.vercel.app` during transition)
- No change to `/__clerk` proxy in code

### 5. Supabase (if GitHub linked)

- Re-authorize GitHub for **Vera-Platforms** org / repo

### 6. Cursor / Codex Cloud

- GitHub integration → grant access to **Vera-Platforms/vera**

### 7. Local machine

```bash
git remote set-url origin https://github.com/Vera-Platforms/vera.git
export GITHUB_REPO=Vera-Platforms/vera
./scripts/sync-main.sh
```

### 8. GitHub branch protection (private org repo)

If `setup-github-branch-protection.sh` returns 403, use GitHub **Pro** or make repo public, or configure protection in UI:

- Require PR, **CI checks**, no force push

```bash
GITHUB_REPO=Vera-Platforms/vera ./scripts/setup-github-branch-protection.sh
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
