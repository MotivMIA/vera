# AI agents — Visual Era

Read this file first. It defines how **Cursor** (supervisor/orchestrator) and **Codex** (worker) collaborate in this repo.

## Golden rules

1. **Never push directly to `main`** — branch protection blocks it.
2. **All work on `agent-<agent>-<feature>` branches** — e.g. `agent-cursor-multi-agent-workflow`.
3. **All changes merge via pull request** — CI + Vercel checks must pass.
4. **One writer per branch** — do not let Cursor and Codex edit the same branch concurrently.
5. **Do not bypass CI** — no force-merge, no admin bypass for agent work.

Optional later: require human approval (`required_approving_review_count: 1`) in branch protection.

## Cursor automation (mandatory)

| When | Command |
|------|---------|
| Start task | `./scripts/start-agent-task.sh cursor <feature-slug>` |
| Assign Codex | `./scripts/start-agent-task.sh codex <feature-slug>` |
| Before commit / PR | `./scripts/agent-status.sh` |
| Open PR (+ auto-merge) | `./scripts/open-agent-pr.sh "[cursor] short summary"` |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |

**Never:** work on `main`, push to `main`, bypass protection (`--admin`, `--force`), or force-merge.

### Auto-merge (default)

Commit + push + PR means merge approval is implied. `open-agent-pr.sh` runs `gh pr merge --auto --squash --delete-branch`. GitHub merges when CI and branch protection pass. Cursor must **not** ask you to manually merge each PR.

**End of every task**, report: branch, commit hash, PR link, checks status, auto-merge status.

### Manual merge fallback

`./scripts/merge-agent-pr.sh` only if auto-merge failed — not the normal flow.

## Roles

| Role | Tool | Branch prefix | Can merge to `main`? |
|------|------|---------------|----------------------|
| **Supervisor / orchestrator** | Cursor | `agent-cursor-*` | No — opens PR only |
| **Worker** | Codex | `agent-codex-*` | No — pushes branch only |
| **Human** | You | any `agent-*` | Yes, via PR UI after checks |

Full playbook: [docs/AI_AGENT_WORKFLOW.md](docs/AI_AGENT_WORKFLOW.md)  
CI & protection: [docs/CI_CD.md](docs/CI_CD.md)

---

## Cursor — supervisor responsibilities

- Break large goals into **small, testable tasks** for Codex or yourself.
- Assign **one branch per task** (`agent-cursor-*` or `agent-codex-*`).
- **Review Codex output** before opening or updating a PR (diff, risks, scope).
- Run checks locally when possible: `npm run lint`, `npm run typecheck`, `npm run build`.
- **Open PRs with auto-merge** (`./scripts/open-agent-pr.sh`); write risk summary and rollback notes.
- Read the **automated PR summary** comment on each PR.
- Report PR link, checks, and auto-merge status — do not ask for routine manual merges.
- **Do not bypass** branch protection or push to `main`.
- Coordinate with human on production deploys after merge to `main`.

---

## Codex — worker responsibilities

- Work **only** on the branch named in the task (e.g. `agent-codex-onboarding-consent`).
- Keep changes **scoped** to the assignment — no unrelated refactors.
- Commit with prefix **`[codex]`** in the subject line.
- **Do not merge** PRs and **do not push to `main`**.
- **Do not change** `middleware.ts`, auth, or env unless the task explicitly allows it.
- Before handoff: report **files changed**, **commands run**, and **remaining risks**.
- Push the branch; let Cursor (supervisor) open or finalize the PR.

---

## Commit message convention

Use a bracket prefix on the **first line**:

```text
[cursor] add multi-agent workflow scripts
[codex] implement consent checkbox validation
[docs] update CI_CD branch protection section
[system] bump lockfile from dependabot
```

Legacy `cursor:` / `codex:` prefixes are acceptable but prefer `[cursor]` / `[codex]`.

---

## Quick commands

| Action | Command |
|--------|---------|
| Start Cursor task | `./scripts/start-agent-task.sh cursor <feature>` |
| Start Codex task | `./scripts/start-agent-task.sh codex <feature>` |
| Agent status | `./scripts/agent-status.sh` |
| Open PR (auto-merge on) | `./scripts/open-agent-pr.sh "[cursor] short title"` |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |
| Install local main guard | `./scripts/install-git-hooks.sh` |

---

## Automation (GitHub)

| Workflow | Purpose |
|----------|---------|
| `ci.yml` | Lint, typecheck, test (if present), build, audit |
| `branch-naming.yml` | Enforce `agent-*` head branch on PRs |
| `pr-summary.yml` | Bot comment: files, risks, reviewer checklist |

Required status check on `main`: **CI checks**

---

## Project context

- Next.js 15 App Router, Clerk, Supabase, Didit, Vercel.
- Production: `https://visual-era.vercel.app`
- Sensitive areas: `middleware.ts`, `lib/didit.ts`, `lib/env.ts`, `app/api/*`

See also [docs/COLLABORATION.md](docs/COLLABORATION.md) for collision avoidance between agents.
