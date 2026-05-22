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

Cursor must use the daily workflow scripts automatically — never improvise branch/PR steps.

| When | Command |
|------|---------|
| **Start any new task** (no branch given) | `./scripts/start-agent-task.sh cursor <feature-slug>` |
| **Assign work to Codex** | `./scripts/start-agent-task.sh codex <feature-slug>` |
| **Before commit or open PR** | `./scripts/agent-status.sh` |
| **Open a PR** | `./scripts/open-agent-pr.sh "[cursor] short summary"` |

**Never:** work on `main`, push to `main`, or bypass branch protection (`--admin`, `--no-verify` for merges).

**End of every task**, report to the human:

- Current branch
- Commit hash
- PR link (if opened)
- Checks status (`gh pr checks` or CI URL)
- Whether manual approval is required (0 approvals on `main` today; re-check branch protection if unsure)

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
- **Open and maintain PRs** (`./scripts/open-agent-pr.sh`); write risk summary and rollback notes.
- Read the **automated PR summary** comment on each PR.
- **Do not merge** until CI checks (and Vercel, if UI) are green.
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
| Open PR | `./scripts/open-agent-pr.sh "[cursor] short title"` |
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
