# GitHub organization migration — natew-dev/vera → Vera-Platforms/vera

**Status:** **Transfer completed** (2026-05). Repo lives at [**Vera-Platforms/vera**](https://github.com/Vera-Platforms/vera). Old URLs redirect.

**Next:** [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md) · [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md)

| | |
|--|--|
| **Repository** | https://github.com/Vera-Platforms/vera |
| **Previous** | natew-dev/vera (redirect) |
| **Repo name** | `vera` (unchanged) |

---

## Executive summary

| Item | Detail |
|------|--------|
| **Recommended target** | `Vera-Platforms/vera` |
| **Risk** | **Medium** — app code unchanged; **Vercel Git reconnect** and **script/doc slug updates** are the main work |
| **Safe to transfer?** | After checklist below + **your explicit approval** |
| **Local `origin` note** | Many clones may still show `MotivMIA/vera`; GitHub API reports owner **`natew-dev`** — align remote before/after transfer |

Run reference scan:

```bash
./scripts/check-github-owner-refs.sh
./scripts/check-github-owner-refs.sh --verbose
```

Legacy migration doc (superseded plan): [../GITHUB_REPO_MIGRATION.md](../GITHUB_REPO_MIGRATION.md) (MotivMIA/visualera — **do not use** for this move).

---

## Pre-migration audit (automated + manual)

### Current repository (verify in browser)

| Setting | Expected / verify |
|---------|-------------------|
| Owner | `natew-dev` (personal account) |
| Default branch | `main` |
| Visibility | Confirm in Settings |
| Open PRs | **Merge or close before transfer** |
| Branch protection | PR required, **CI checks**, no force push — re-verify after transfer |

```bash
GITHUB_REPO=natew-dev/vera ./scripts/audit-github-repo-settings.sh
```

### GitHub Actions

| Workflow | Required for merge? |
|----------|-------------------|
| `ci.yml` → **CI checks** | Yes |
| `branch-naming.yml` → **Agent branch naming** | PR gate |
| `pr-summary.yml` | Comment only |

**Actions secrets (names only):** none required today — CI uses workflow `env` placeholders in `ci.yml`.

**Actions variables:** none expected.

### Integrations to re-check after transfer (no changes in this PR)

| Service | What to verify |
|---------|----------------|
| **Vercel** | Project **visual-era** → Settings → Git → connect **Vera-Platforms/vera**; production branch `main`; redeploy |
| **Supabase** | Dashboard → org/project → GitHub integration (if enabled) → authorize **Vera-Platforms** |
| **Clerk** | Allowed origins / redirect URLs still `https://visual-era.vercel.app` (product URL — unchanged) |
| **Cursor / Codex Cloud** | GitHub App access to new org/repo path |
| **Fine-grained PATs** | Repo scope `Vera-Platforms/vera` |

### Local git remote mismatch

| Source | Value |
|--------|--------|
| `git remote -v` (this clone) | May show `MotivMIA/vera` (stale) |
| `gh repo view natew-dev/vera` | Owner `natew-dev` |

Before transfer, confirm canonical URL in GitHub UI. After transfer, **must** update `origin` (see below).

---

## Pre-migration backup steps (human)

- [ ] **No open PRs** on `natew-dev/vera` (or merge all intended work)
- [ ] Run `./scripts/check-github-owner-refs.sh` — save output in issue/notes
- [ ] Run `GITHUB_REPO=natew-dev/vera ./scripts/audit-github-repo-settings.sh` — save output
- [ ] Export optional: Settings → General → copy important wiki/issues if any
- [ ] Note Vercel production deployment ID / URL (`https://visual-era.vercel.app`)
- [ ] Confirm **Vera-Platforms** org exists and you are **owner/admin**
- [ ] Confirm no other collaborator relies on old URL only
- [ ] **Do not delete** `natew-dev` account or repo as part of migration
- [ ] Brief freeze: avoid `agent-finish` during transfer window (~15 min)

---

## GitHub repo transfer steps (human — after explicit approval)

**Do not run until you approve.**

1. Open https://github.com/natew-dev/vera/settings  
2. **General** → **Danger Zone** → **Transfer ownership**  
3. New owner: organization **`Vera-Platforms`**  
4. Repository name: **`vera`**  
5. Confirm transfer  

Docs: [Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)

**Transfers with repo:** issues, PRs, branches, Actions workflows, templates, most settings, redirect from old URL.

**Re-verify manually:** branch protection, Vercel GitHub App, PAT scopes, org secrets (if added later).

---

## Local git remote update (after transfer)

```bash
git remote set-url origin git@github.com:Vera-Platforms/vera.git
# or HTTPS:
# git remote set-url origin https://github.com/Vera-Platforms/vera.git

git remote -v
git fetch origin
git status
./scripts/sync-main.sh
```

Set default for agent scripts:

```bash
export GITHUB_REPO=Vera-Platforms/vera
```

Update `scripts/lib/github-repo.sh` → `DEFAULT_REPO="Vera-Platforms/vera"` (post-migration PR).

---

## Vercel reconnect / check (human — report first)

| Step | Action |
|------|--------|
| 1 | Vercel Dashboard → project **visual-era** → **Settings** → **Git** |
| 2 | Disconnect old GitHub link if needed |
| 3 | Connect **Vera-Platforms/vera** |
| 4 | Install/authorize Vercel GitHub App on **Vera-Platforms** org |
| 5 | Production branch = **`main`** |
| 6 | Trigger production deploy; run `./scripts/production-clerk-proxy-smoke.sh` |
| 7 | Confirm https://visual-era.vercel.app |

**Do not** change Vercel env var values during Git reconnect unless intentionally rotating secrets.

---

## Supabase GitHub integration check

- [ ] Supabase project linked to repo (if used for branching/previews)  
- [ ] Re-authorize GitHub for **Vera-Platforms** org  
- [ ] Migrations still applied via PR workflow (no change to process)  
- [ ] `supabase/config.toml` `project_id` is product id — **no GitHub owner** change needed  

---

## Clerk domain / auth check

Product hosts stay the same:

- `https://visual-era.vercel.app`
- Same-origin `/__clerk` proxy (see `middleware.ts`, `docs/VERCEL_DEPLOYMENT.md`)

After Vercel reconnect:

- [ ] Sign-in / sign-up on production  
- [ ] Onboarding consent → verify-identity path  
- [ ] `./scripts/ops/verify-clerk-redirects.sh`  

**No Clerk dashboard change** required solely for GitHub org migration unless redirect URLs referenced old GitHub Pages (they do not today).

---

## GitHub Actions secrets review

| Secret | Status (pre-transfer) |
|--------|------------------------|
| Repository secrets | None listed — CI placeholders only |
| Organization secrets (Vera-Platforms) | Add only if future workflows need them |

Never commit secret values. Re-list after transfer:

```bash
gh secret list --repo Vera-Platforms/vera
```

---

## Branch protection review

Expected rules on `main` (re-apply if missing):

```bash
GITHUB_REPO=Vera-Platforms/vera ./scripts/setup-github-branch-protection.sh
```

| Rule | Expected |
|------|----------|
| Require PR | Yes |
| Required check | **CI checks** (strict) |
| Force push / delete | Disabled |
| Enforce admins | Yes |
| Conversation resolution | Yes |

---

## Repo permissions review

After transfer, in **Vera-Platforms** org:

- [ ] Teams / members with least privilege  
- [ ] Admin limited to owners  
- [ ] Cursor/Codex GitHub apps installed on org  
- [ ] Dependabot / security settings reviewed  

---

## Files to update after transfer (not in prep PR)

Run `./scripts/check-github-owner-refs.sh --verbose` after edits.

### Scripts (`GITHUB_REPO` / default slug)

| File |
|------|
| `scripts/lib/github-repo.sh` |
| `scripts/open-agent-pr.sh` |
| `scripts/merge-agent-pr.sh` |
| `scripts/ai-issue-intake.sh` |
| `scripts/start-ai-issue-task.sh` |
| `scripts/setup-ai-issue-labels.sh` |
| `scripts/create-identity-followup-issues.sh` |
| `scripts/setup-github-branch-protection.sh` |
| `scripts/ops/verify-github-repo-health.sh` |
| `scripts/audit-github-repo-settings.sh` |
| `scripts/configure-vercel-deployment-protection.sh` (comment only) |

### Docs with `github.com/.../vera` or `MotivMIA/vera`

| File |
|------|
| `docs/CI_CD.md` |
| `docs/OPERATIONAL_IDENTITY.md` (ownership sections only) |
| `docs/ACCOUNT_STRUCTURE.md` (GitHub org tables) |
| `docs/ENTERPRISE_AUTOMATION_ACCESS.md` |
| `docs/IDENTITY_STANDARDIZATION_SUMMARY.md` |
| `docs/ops/OPEN_OPS_ISSUES.md` |
| `docs/PLATFORM_AGENT_ROLLOUT.md` |
| `docs/CODEX_CLOUD_DELEGATION.md` |
| `docs/prompts/chatgpt-orchestration-review.md` |
| `docs/prompts/platform-agent-task.md` |
| `.agent/tasks/issue-26.md` |
| `AGENTS.md` |

### Do **not** change for org migration (product branding)

- `package.json` / `package-lock.json` name `visual-era`
- `visual-era.com` email aliases
- `visual-era.vercel.app` URLs
- Legal copy in `lib/legal/documents.ts` (unless explicitly GitHub URLs)

### Identity note (GitHub org layout)

- **Personal account:** `natew-dev` — administers both orgs  
- **Product org:** `Vera-Platforms` — owns `vera` (sibling to MotivMIA, not nested inside it)  
- **Incubator org:** `MotivMIA` — other repos; does **not** own `vera`  
- **Commit email:** `admin@visual-era.com` (unchanged)  

See [OPERATIONAL_IDENTITY.md](../OPERATIONAL_IDENTITY.md) and [ACCOUNT_STRUCTURE.md](../ACCOUNT_STRUCTURE.md).

---

## Post-migration smoke test

- [ ] `git fetch origin` && `main` matches GitHub  
- [ ] `GITHUB_REPO=Vera-Platforms/vera ./scripts/audit-github-repo-settings.sh`  
- [ ] `./scripts/check-github-owner-refs.sh` — legacy slugs only where intentional  
- [ ] `./scripts/ops/run-phase2-verify.sh`  
- [ ] Open `agent-cursor-*` PR → **CI checks** + **Agent branch naming** green  
- [ ] Auto-merge test (docs-only PR optional)  
- [ ] Vercel production deploy from `main`  
- [ ] `https://visual-era.vercel.app` + Clerk smoke script  
- [ ] Issue links work on new URL (old issues redirect with repo)  

---

## Rollback / redirect notes

| Scenario | Action |
|----------|--------|
| Wrong org transferred | GitHub support / transfer back per policy |
| Broken CI | Re-run workflows; re-apply branch protection script |
| Broken Vercel | Re-link repo or rollback deployment in Vercel UI |
| Old links | `github.com/natew-dev/vera` redirects to new location after transfer — **do not delete** old path intentionally |

**No force push to `main`.** Revert via PR only.

---

## Readiness checklist

| # | Item | Status |
|---|------|--------|
| 1 | Target org **Vera-Platforms** exists | Verify in GitHub |
| 2 | You are admin on `natew-dev/vera` and org | Human |
| 3 | Open PRs cleared | Human |
| 4 | `check-github-owner-refs.sh` baseline saved | Run before transfer |
| 5 | Vercel reconnect steps understood | Documented above |
| 6 | Explicit approval to transfer | **Required** |
| 7 | Prep PR merged (`docs/ops/GITHUB_ORG_MIGRATION.md`, check script) | This PR |

**Verdict:** Ready for transfer when you approve and complete human checklist. **This PR does not transfer the repository.**

---

## After you confirm transfer

Tell Cursor: **“Transfer complete — Vera-Platforms/vera.”**

Cursor will:

1. Set `DEFAULT_REPO="Vera-Platforms/vera"` in `scripts/lib/github-repo.sh`  
2. Update `github.com/.../vera` links in docs/scripts per table above  
3. Update `origin` and run smoke checks  
4. Ship via normal `agent-finish.sh` workflow  

---

## Related

- [AGENTS.md](../../AGENTS.md)  
- [CI_CD.md](../CI_CD.md)  
- `./scripts/check-github-owner-refs.sh`  
- `./scripts/audit-github-repo-settings.sh`  
- `./scripts/setup-github-branch-protection.sh`
