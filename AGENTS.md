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
| Before commit / PR | `./scripts/agent-status.sh` (use `--pre-pr` before opening PR) |
| Open PR (+ auto-merge) | `./scripts/open-agent-pr.sh "[cursor] short summary"` |
| Sync local `main` | `./scripts/sync-main.sh` |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |

**Never:** work on `main`, push to `main`, bypass protection (`--admin`, `--force`), or force-merge.

### Auto-merge (default)

Commit + push + PR means merge approval is implied. `open-agent-pr.sh` enables `gh pr merge --auto --squash --delete-branch` **immediately** after the PR is created. GitHub merges when required checks pass. Cursor must **not** ask you to manually merge each PR.

- **Wait time:** script polls up to **120s** (override with `MERGE_WAIT_TIMEOUT=300`), then exits cleanly while auto-merge continues on GitHub.
- **Checks:** script prints pending/passed checks via `gh pr checks`; Vercel preview and PR summary are **not** required for merge.
- **Sync:** if merge finishes within the wait window, `sync-main.sh` runs automatically; otherwise sync at the next task start.

### Sync local `main` (automatic)

- `start-agent-task.sh` requires a **clean working tree**, then syncs `main` before every new agent branch (`sync-main.sh`).
- After auto-merge, `open-agent-pr.sh` may sync `main` if merge completed within the short wait window.
- If still pending: run `./scripts/sync-main.sh` or sync at the next task start.
- Never force-pull or hard-reset; fails if uncommitted changes would be at risk.

**End of every task**, report (from `open-agent-pr.sh` task report when possible):

| Field | Example |
|-------|---------|
| Branch | `agent-cursor-my-feature` |
| Commit | short SHA |
| PR link | GitHub URL |
| Checks | pending / passed (CI checks, branch naming) |
| Auto-merge | yes / no |
| Local `main` sync | yes + hash / pending |
| Manual step | none, or `sync-main.sh` after merge |

### Manual merge fallback

`./scripts/merge-agent-pr.sh` only if auto-merge failed — not the normal flow.

### Automatic Codex delegation

You describe the task in **plain English**. Cursor decides whether to work alone, pair with Codex, or send Codex first — **do not** require you to say “use Codex.”

**Classifications** (Cursor reports briefly at task start):

| Class | Meaning |
|-------|---------|
| **cursor-only** | Cursor plans and implements on `agent-cursor-*` |
| **codex-assisted** | Codex implements on `agent-codex-*`; Cursor reviews and may fix on `agent-cursor-*` |
| **codex-first** | Clear plan exists; Codex implements first; Cursor reviews before PR |

**Cursor handles directly:** planning, architecture, reviewing Codex work, UI/UX judgment, final PR summary, risky changes, merge/auto-merge reporting.

**Delegate to Codex when useful:** isolated bug fixes, tests, refactors, repetitive edits, utility scripts, docs cleanup, small backend/API tasks, turning a clear plan into code.

**Do not delegate to Codex:** secrets/auth/security-sensitive changes, database migrations, payment/billing, major architecture, legal/compliance copy, production deploy settings, anything ambiguous (plan in Cursor first).

### Ownership locking (Cursor vs Codex)

| Cursor-owned (supervisor only) | Codex-safe (when scoped + reviewed) |
|--------------------------------|-------------------------------------|
| Architecture, routing, `middleware.ts` | Isolated UI components |
| Auth, security, Clerk/Supabase wiring | Tests |
| `app/api/*`, `lib/env.ts`, `lib/didit.ts` | Utility functions |
| DB migrations, schema | Repetitive refactors |
| Vercel/deployment, env vars, `docs/VERCEL_DEPLOYMENT.md` | Docs cleanup (non-deploy) |
| Billing/payments, production settings | Small API helpers from a clear plan |
| `.github/workflows/`, branch protection scripts | Clearly scoped bug fixes |

**Rule:** If a task touches a **Cursor-owned** path, Cursor implements or **reviews before PR**. Codex must **not** open a PR that modifies Cursor-owned files without Cursor review. `./scripts/agent-status.sh --pre-pr` flags those paths; Codex PRs that touch them **exit with error**.

#### Decision table

| Task type | Owner |
|-----------|--------|
| Planning / architecture | Cursor |
| Simple implementation from clear plan | Codex |
| Tests | Codex |
| Review / final judgment | Cursor |
| Security / auth / secrets | Cursor only |
| Database migrations | Cursor only (unless you explicitly approve Codex) |
| UI polish | Cursor |
| Repetitive edits | Codex |

#### Delegation workflow

1. You give a task → Cursor classifies (`cursor-only` \| `codex-assisted` \| `codex-first`) and states why.
2. If Codex helps → `./scripts/start-agent-task.sh codex <feature-slug>` (Cursor creates the branch).
3. Codex works only on that branch; commits `[codex] short summary`; pushes.
4. Cursor reviews diff, runs checks, fixes on `agent-cursor-*` if needed.
5. Cursor opens PR: `./scripts/open-agent-pr.sh "[cursor] …"` or `"[codex] …"` as appropriate.
6. Auto-merge after CI passes; never push to `main`; never `--admin`.

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

- **Classify every task** automatically (`cursor-only`, `codex-assisted`, `codex-first`); tell the human in one sentence.
- **Create Codex branches** when delegation helps — without being asked to “use Codex.”
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
| Sync `main` | `./scripts/sync-main.sh` |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |
| Install local main guard | `./scripts/install-git-hooks.sh` |

---

## Conflict prevention

Before **starting** a task: clean working tree → `./scripts/start-agent-task.sh` (syncs `main`, creates isolated branch).

Before **opening a PR**: `./scripts/agent-status.sh --pre-pr` — lists files vs `main`, flags Cursor-owned paths.

**One writer per branch** — never Cursor and Codex on the same branch concurrently.

## Automation (GitHub)

| Workflow | Purpose | Blocks merge? |
|----------|---------|---------------|
| `ci.yml` | Lint+typecheck (parallel), test if present, build; docs-only fast path | **Yes** — `CI checks` |
| `branch-naming.yml` | Enforce `agent-*` head branch on PRs | Yes (failed check) |
| `pr-summary.yml` | Bot comment: files, ownership, risks | No (informational) |
| Vercel | Preview deploy per PR | No (unless you add it in branch protection) |

Required status check on `main`: **CI checks** only.

---

## Project context

- Next.js 15 App Router, Clerk, Supabase, Didit, Vercel.
- Production: `https://visual-era.vercel.app` (not raw `visual-*-motivmias-projects.vercel.app` deployment URLs — see [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md))
- Sensitive areas: `middleware.ts`, `lib/didit.ts`, `lib/env.ts`, `app/api/*`

See also [docs/COLLABORATION.md](docs/COLLABORATION.md) for collision avoidance between agents.
