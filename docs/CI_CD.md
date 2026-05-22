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
[cursor] short description
[codex] short description
[docs] short description
[system] short description
```

Legacy `cursor:` / `codex:` prefixes still work; prefer bracket form for new commits.

## CI pipeline

File: [.github/workflows/ci.yml](../.github/workflows/ci.yml)

| Change type | Job | Steps |
|-------------|-----|--------|
| App/code | **CI checks** | `npm ci` (cached) → lint ∥ typecheck → tests (if script) → build → advisory audit |
| Docs/markdown only | **CI checks** (fast) | Skips lint/build; satisfies required check |

Concurrency cancels superseded runs on the same PR. Push to `agent-*` still runs full CI when code changes.

### Additional workflows

| Workflow | Check name | Purpose |
|----------|------------|---------|
| `branch-naming.yml` | Agent branch naming | Head branch must be `agent-*` |
| `pr-summary.yml` | — | Bot comment: files, risks, checklist |

See [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md) for supervisor/worker roles and scripts.

**Triggers**

- **Pull requests** into `main` only (no CI on every `agent-*` push — open the PR when ready)

**CI tiers (single job, path-detected)**

| Changes | What runs |
|---------|-----------|
| Docs/markdown only | Pass (~15s) |
| `.github/`, `scripts/` only | `npm ci` + lint ∥ typecheck (no build) |
| App code | Full lint, typecheck, build, advisory audit |

**Required check name for branch protection:** `CI checks` (Vercel preview optional)

## Branch protection on `main` (enabled)

`main` is protected on **MotivMIA/vera** with:

| Rule | Setting |
|------|---------|
| Pull request required | Yes (0 approvals; conversation must be resolved) |
| Required status check | **CI checks** (branch must be up to date) |
| Force push / delete branch | Disabled |
| Admins | Same rules apply (`enforce_admins`) |

Re-apply after changes: `./scripts/setup-github-branch-protection.sh`

**Private repos** need GitHub Pro for this API; **public** repos can use the script above (HTTP 403 on private → make public or upgrade).

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
./scripts/start-agent-task.sh cursor my-feature
# … work, commit: [cursor] summary …
git push -u origin agent-cursor-my-feature
./scripts/open-agent-pr.sh "[cursor] my feature"
```

Or use `./scripts/agent-status.sh` to see branch state and open PR hints.

Merge only when **CI checks** is green and review is done.

## Direct pushes to `main`

Blocked once branch protection is enabled. Use PRs only.

Emergency bypass requires a repo admin temporarily disabling protection (avoid for agent workflows).

## Vercel

Production deploys should track **`main`** after merge. Preview deploys typically run per PR (configure in Vercel project settings).
