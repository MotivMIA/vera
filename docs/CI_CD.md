# CI/CD and branch protection

Visual Era uses **GitHub Actions** for quality gates and **branch protection** on `main` so nothing merges without passing checks.

## Workflow

```text
main (protected)
  ↑ PR only (CI must pass)
agent-[AGENT]-[feature]  ← Codex / Cursor / you commit here
```

### Agent branches

```text
agent-cursor-didit-vercel-fix
agent-codex-onboarding-consent
```

Legacy lanes `codex` and `cursor` also run CI on push.

### Commit message format

```text
cursor: short description
codex: short description
```

## CI pipeline

File: [.github/workflows/ci.yml](../.github/workflows/ci.yml)

| Step | Command |
|------|---------|
| Install | `npm ci` |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
| Build | `npm run build` |

**Triggers**

- Every **pull request** into `main`
- Every **push** to `agent-*`, `codex`, or `cursor`

**Required check name for branch protection:** `CI checks`

## One-time: protect `main` on GitHub

Branch protection cannot live in git alone; enable it on GitHub (repo admin).

**Private repos:** GitHub requires **Pro** (or Team/Enterprise), or a **public** repository, to use classic branch protection via the API/UI. If `setup-github-branch-protection.sh` returns HTTP 403, upgrade the org/account, make the repo public, or enforce the workflow manually (no direct pushes to `main` by convention) until protection is available.

### Option A — Script (GitHub CLI)

```bash
# Install gh and authenticate: gh auth login
./scripts/setup-github-branch-protection.sh
```

### Option B — GitHub UI

1. Repo → **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable:
   - **Require a pull request before merging**
   - **Require status checks to pass** → select **CI checks**
   - **Require branches to be up to date before merging**
   - **Do not allow bypassing the above settings** (recommended)
4. Disable **Allow force pushes** and **Allow deletions**
5. Save

### Option C — `gh api` manually

```bash
gh api repos/MotivMIA/vera/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [{ "context": "CI checks" }]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF
```

After the first CI run on a PR, **CI checks** appears in the status-check dropdown.

## Creating a PR (agents or you)

```bash
git checkout main
git pull origin main
git checkout -b agent-cursor-my-feature

# … work, commit …
git push -u origin agent-cursor-my-feature

gh pr create --base main --head agent-cursor-my-feature \
  --title "cursor: my feature" \
  --body "Summary and test plan"
```

Merge only when **CI checks** is green and review is done.

## Direct pushes to `main`

Blocked once branch protection is enabled. Use PRs only.

Emergency bypass requires a repo admin temporarily disabling protection (avoid for agent workflows).

## Vercel

Production deploys should track **`main`** after merge. Preview deploys typically run per PR (configure in Vercel project settings).
