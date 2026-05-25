# GitHub repository migration — MotivMIA/vera → visualera/vera

**Status:** Pre-migration preparation only. **No transfer executed.** **Old repo must not be deleted.**

**Recommended target:** `visualera/vera` → https://github.com/visualera/vera

---

## Executive summary

| Item | Assessment |
|------|------------|
| **Recommended name** | **`visualera/vera`** — matches product (VERA), company (Visual Era), minimal rename friction |
| **Risk level** | **Medium** — low code risk; **Vercel GitHub link** and **local remotes** need deliberate follow-up |
| **Safe to transfer now?** | **Almost** — confirm checklist below first |
| **Owner today** | User account **`MotivMIA`** → transferring to **`visualera`** account |
| **Target owner type** | **`visualera` is a GitHub User account** (Visual Era), not an Organization — transfer still yields `visualera/vera` |

### Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| **visualera/vera** ✅ | Clean URL; keeps scripts/issues mental model | None significant |
| visualera/platform | Generic | Loses `vera` product name in URL |
| visualera/visual-era | Marketing-aligned | Longer; more doc churn |
| visualera/app | Too generic | Ambiguous with multiple apps later |

---

## Pre-migration audit (2026-05-25)

Run anytime:

```bash
./scripts/audit-github-repo-settings.sh
# After org exists:
# GITHUB_REPO=visualera/vera ./scripts/audit-github-repo-settings.sh
```

### Current state

| Setting | Value |
|---------|--------|
| **Remote (local)** | `https://github.com/MotivMIA/vera.git` |
| **Default branch** | `main` |
| **Visibility** | Public |
| **Owner type** | User (`MotivMIA`) |
| **Auto-merge** | Allowed at repo level |
| **Merge methods** | Merge commit, squash, rebase (all allowed) |
| **Delete branch on merge** | false |

### Branch protection (`main`)

| Rule | Setting |
|------|---------|
| Require PR | Yes (0 approvals) |
| Required check | **CI checks** (strict / up to date) |
| Conversation resolution | Required |
| Force push | Disabled |
| Branch deletion | Disabled |
| Enforce for admins | Yes |
| Rulesets | 0 |

Re-apply after migration if missing:

```bash
GITHUB_REPO=visualera/vera ./scripts/setup-github-branch-protection.sh
```

### GitHub Actions workflows

| Workflow | Required check? |
|----------|-----------------|
| `ci.yml` → job **CI checks** | Yes (branch protection) |
| `branch-naming.yml` → **Agent branch naming** | Runs on PR (not required for merge) |
| `pr-summary.yml` | Bot comment only |

**Repo Actions secrets:** none listed (CI uses **placeholder env** in `ci.yml` — no secret migration needed for CI).

**Repo Actions variables:** none.

**Webhooks:** list via audit script; **Vercel** typically uses GitHub App integration (reconnect after transfer).

### Templates

| Path | Transfers with repo? |
|------|----------------------|
| `.github/pull_request_template.md` | Yes |
| `.github/ISSUE_TEMPLATE/*.md` | Yes |
| `.github/workflows/*` | Yes |

### Deploy / Vercel (report only — do not change blindly)

| Item | Finding |
|------|---------|
| Production URL | `https://visual-era.vercel.app` (from docs/CI) |
| Vercel team | `motivmias-projects` (CLI preview list) |
| GitHub link | Expect link to **MotivMIA/vera** today |

**After transfer — manual in Vercel dashboard:**

1. Project → **Settings** → **Git** → reconnect repository to **`visualera/vera`**
2. Confirm **Production branch** = `main`
3. Confirm GitHub App has access to **visualera** org
4. Trigger production deploy or wait for merge to `main`
5. Verify preview + production URLs

**Do not** delete the Vercel project. **Do not** change env values during Git reconnect.

### Agent workflow (must preserve)

| Behavior | How it is enforced |
|----------|-------------------|
| Protected `main` | Branch protection API / script |
| PR required | Branch protection |
| CI before merge | Required check **CI checks** |
| Agent branch naming | `branch-naming.yml` on PRs |
| Auto-merge after CI | `open-agent-pr.sh` / `agent-finish.sh` |
| No force push | Protection + agent rules in `AGENTS.md` |
| Local hooks | `scripts/lib/agent-git.sh` (if configured) |

Scripts default repo via `GITHUB_REPO` (default `MotivMIA/vera` until post-migration). See `scripts/lib/github-repo.sh`.

---

## What transfers automatically (GitHub transfer)

When you transfer **MotivMIA/vera** → **visualera** org (same repo name `vera`):

| Transfers | Notes |
|-----------|--------|
| Git history, branches, tags | Full |
| Issues & PRs | Numbering preserved |
| Stars, watchers | Redirect from old URL |
| Wiki / projects (if used) | Yes |
| `.github/workflows` | Yes — re-run Actions after transfer |
| Issue/PR templates | Yes |
| Branch protection rules | **Usually preserved** — verify immediately |
| Redirect | `github.com/MotivMIA/vera` → new location |

| May NOT transfer / needs verification |
|---------------------------------------|
| Org-level secrets vs repo secrets | Re-check; current repo has **no** Actions secrets |
| GitHub App installations (Vercel, Cursor, etc.) | **Reconnect** org/repo access |
| Deploy keys | Rare; list in Settings → Deploy keys |
| Fine-grained PAT repo scope | Update token repo path to `visualera/vera` |
| `GITHUB_REPO` in developer shells | Update exports / docs |
| Codex Cloud / Cursor cloud GitHub link | Re-authorize new repo path |

**Do not delete** MotivMIA/vera — transfer leaves a redirect; deletion breaks links and is irreversible.

---

## What requires GitHub UI (human)

### Before transfer

- [ ] Create **visualera** GitHub organization (if not exists)
- [ ] You are **owner** on `visualera` and **admin** on `MotivMIA/vera`
- [ ] No open PRs you are not willing to pause (or merge first)
- [ ] Run `./scripts/audit-github-repo-settings.sh` and save output
- [ ] Announce brief freeze: no `agent-finish` during transfer window (optional, ~15 min)

### Transfer UI path

1. Open https://github.com/MotivMIA/vera/settings
2. **General** → scroll to **Danger Zone**
3. **Transfer ownership**
4. New owner: **`visualera`** (user account — or organization if you convert/create one later)
5. Type repository name to confirm: `vera`
6. Complete transfer

GitHub docs: [Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)

### Immediately after transfer

```bash
# 1. Audit new location
GITHUB_REPO=visualera/vera ./scripts/audit-github-repo-settings.sh

# 2. Re-apply protection if audit shows gaps
GITHUB_REPO=visualera/vera ./scripts/setup-github-branch-protection.sh

# 3. Update local remote
git remote set-url origin git@github.com:visualera/vera.git
# or: git remote set-url origin https://github.com/visualera/vera.git

git remote -v
git fetch origin
git status

# 4. Sync main
./scripts/sync-main.sh

# 5. Smoke test agent workflow
./scripts/start-agent-task.sh cursor post-migration-smoke
./scripts/agent-quick-check.sh
# agent-finish only when ready — confirms CI + auto-merge on new repo

# 6. Ops verify
./scripts/ops/run-phase2-verify.sh
```

### Vercel (human — report first)

| Step | Action |
|------|--------|
| 1 | Vercel → Project **visual-era** → Settings → Git |
| 2 | Disconnect old repo if needed; connect **visualera/vera** |
| 3 | Install/authorize Vercel GitHub App on **visualera** org |
| 4 | Production branch = `main` |
| 5 | Redeploy production; open `https://visual-era.vercel.app` |

### Secrets / env

| Location | Action |
|----------|--------|
| GitHub Actions secrets | **None today** — nothing to copy |
| Vercel env | **Unchanged** by Git transfer — verify project still has Clerk/Supabase/etc. |
| Local `.env.local` | No change |
| 1Password | Update item notes with new repo URL |

---

## Cursor vs human responsibilities

| Task | Who |
|------|-----|
| Run audit scripts | Cursor or human |
| Transfer repo | **Human only** (Danger Zone) |
| Reconnect Vercel | **Human only** |
| Update `origin` remote | Human or Cursor (local) |
| Bulk doc/script `MotivMIA/vera` → `visualera/vera` | **Cursor after you confirm transfer** |
| `DEFAULT_REPO` in `scripts/lib/github-repo.sh` | Cursor post-migration PR |
| Verify CI / auto-merge | Cursor + human |
| Delete old repo | **Never** (unless explicit DR plan) |

---

## Post-migration reference updates (do NOT do until transfer confirmed)

Search:

```bash
rg 'MotivMIA/vera|github\.com/MotivMIA|MOTIVMIA' --glob '!node_modules'
```

### Scripts using `GITHUB_REPO` (default change + optional `github-repo.sh`)

| File |
|------|
| `scripts/open-agent-pr.sh` |
| `scripts/merge-agent-pr.sh` |
| `scripts/ai-issue-intake.sh` |
| `scripts/start-ai-issue-task.sh` |
| `scripts/setup-ai-issue-labels.sh` |
| `scripts/create-identity-followup-issues.sh` |
| `scripts/setup-github-branch-protection.sh` |
| `scripts/ops/verify-github-repo-health.sh` |
| `scripts/lib/github-repo.sh` → set `DEFAULT_REPO="visualera/vera"` |

### Docs with hardcoded links (update in dedicated PR)

| File | Notes |
|------|--------|
| `docs/CI_CD.md` | Protection examples |
| `docs/OPERATIONAL_IDENTITY.md` | Architecture URLs |
| `docs/ACCOUNT_STRUCTURE.md` | Org naming policy |
| `docs/ENTERPRISE_AUTOMATION_ACCESS.md` | Repo slug |
| `docs/IDENTITY_STANDARDIZATION_SUMMARY.md` | Links |
| `docs/ops/OPEN_OPS_ISSUES.md` | Issue URLs |
| `docs/PLATFORM_AGENT_ROLLOUT.md` | Issue URLs |
| `docs/prompts/*.md` | Orchestration prompts |
| `docs/CODEX_CLOUD_DELEGATION.md` | Cloud agent GitHub connect |
| `.agent/tasks/*.md` | Issue links |

**Identity docs:** May still reference **MotivMIA** GitHub *user* for historical commits; add **visualera** org as new owner while keeping contributor account story clear.

### Templates

No MotivMIA hardcoding in PR/issue templates today — no change required.

---

## Rollback plan

| Scenario | Action |
|----------|--------|
| Transfer mistake | GitHub support / transfer back if within policy; avoid deletion |
| Broken CI | Re-run workflow; re-apply branch protection script |
| Broken Vercel | Reconnect previous repo or rollback deployment in Vercel UI |
| Wrong remote | `git remote set-url origin` back to old URL (redirect may still work) |

**No force push to `main`.** Revert via PR only.

---

## Post-migration smoke test

- [ ] `git fetch origin` && `main` matches GitHub
- [ ] `./scripts/audit-github-repo-settings.sh` shows protection + **CI checks**
- [ ] Open test PR from `agent-cursor-*` — **Agent branch naming** + **CI checks** green
- [ ] Auto-merge enables on PR (optional test with docs-only commit)
- [ ] `gh pr list --repo visualera/vera` works
- [ ] Vercel production deploy from `main` succeeds
- [ ] `https://visual-era.vercel.app` loads
- [ ] `./scripts/ops/verify-github-repo-health.sh` OK
- [ ] Cursor/Codex Cloud GitHub integration points at new repo

---

## Readiness checklist — safe to transfer?

| # | Requirement | Status |
|---|-------------|--------|
| 1 | `visualera` account exists and you control it | ✅ User `visualera` exists (public profile). Confirm you can log in and receive transfers. |
| 2 | Branch protection documented & script ready | ✅ |
| 3 | No undeclared Actions secrets to migrate | ✅ (none) |
| 4 | Workflows committed in repo | ✅ |
| 5 | Vercel reconnect steps understood | ✅ (documented) |
| 6 | Rollback / no-delete policy understood | ✅ |
| 7 | Post-migration PR plan for slug updates | ✅ (this doc) |
| 8 | Open PRs merged or paused | ⏳ Check before transfer |

**Verdict:** **Ready to transfer** — `main` is current, no open PRs, `visualera` user exists. Plan Vercel Git reconnect immediately after transfer.

---

## After you confirm transfer complete

Tell Cursor:

> Transfer complete. Update repo references to visualera/vera, update `scripts/lib/github-repo.sh` default, update local origin, run smoke checks.

Cursor will:

1. Open `agent-cursor-post-migration-repo-slug` (or similar)
2. Replace `MotivMIA/vera` in docs/scripts (not identity history where MotivMIA user is intentional)
3. Set `DEFAULT_REPO="visualera/vera"`
4. Run `sync-main`, `agent-quick-check`, audit script
5. Ship small PR via `agent-finish.sh`

---

## Related

- [AGENTS.md](../AGENTS.md)
- [CI_CD.md](./CI_CD.md)
- `./scripts/setup-github-branch-protection.sh`
- `./scripts/audit-github-repo-settings.sh`
