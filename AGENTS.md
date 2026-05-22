# AI agents — Visual Era

Read this file first. **Cursor is the default coding agent** for this repo — it plans, implements, reviews, and opens PRs. **Codex is optional**: use it only for isolated, clearly scoped tasks when Cursor delegates. Cursor keeps **final authority** over architecture, file ownership, review, and PR creation.

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
| Start task (default) | `./scripts/start-agent-task.sh cursor <feature-slug>` |
| Optional Codex worker | `./scripts/start-agent-task.sh codex <feature-slug>` — only when Cursor delegates |
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

### Default agent: Cursor

Unless Cursor explicitly opts into Codex help, treat every task as **Cursor work** on `agent-cursor-*`. You do **not** need to say “use Cursor” — that is the default.

**Classifications** (Cursor reports briefly at task start):

| Class | When | Who codes |
|-------|------|-----------|
| **cursor-only** (default) | Normal tasks — planning, features, fixes, review, PR | Cursor on `agent-cursor-*` |
| **codex-assisted** (optional) | Narrow scope, explicit Cursor delegation, Codex-safe paths only | Codex on `agent-codex-*`; Cursor reviews and **opens the PR** |

There is no **codex-first** default. Codex does not own the task, architecture, or merge path.

**Cursor always owns:** architecture, file ownership decisions, diff review, PR creation (`open-agent-pr.sh`), risk/rollback notes, auto-merge reporting, and any change to Cursor-owned paths.

**Optional Codex (only when Cursor delegates):** isolated tests, utility scripts, repetitive edits, docs cleanup (non-deploy), or a **single** clearly bounded fix in Codex-safe paths — with a written brief from Cursor.

**Never delegate to Codex:** secrets/auth, `middleware.ts`, env, migrations, payments, architecture, production/Vercel settings, ambiguous work, or anything touching Cursor-owned paths without Cursor implementing or reviewing on `agent-cursor-*`.

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

| Task type | Default owner |
|-----------|----------------|
| Planning / architecture | Cursor |
| Implementation (features, fixes, refactors) | Cursor |
| Review / final judgment | Cursor |
| PR creation and auto-merge | Cursor only |
| Security / auth / secrets | Cursor only |
| Database migrations | Cursor only |
| UI polish and product judgment | Cursor |
| Tests / utilities / repetitive edits | Cursor; Codex only if Cursor delegates |
| Narrow Codex-safe fix with a written brief | Codex implements → Cursor reviews → Cursor opens PR |

#### Workflow

1. You describe the task → Cursor classifies (**cursor-only** unless delegation is justified).
2. **Default:** `./scripts/start-agent-task.sh cursor <feature-slug>` → Cursor implements, commits `[cursor]`, pushes.
3. **Optional Codex:** Cursor creates `agent-codex-*`, gives a tight brief; Codex commits `[codex]` and pushes; **does not open the PR**.
4. Cursor reviews the diff (and patches on `agent-cursor-*` if needed).
5. **Cursor** opens the PR: `./scripts/open-agent-pr.sh "[cursor] …"` — always, including after Codex work.
6. Auto-merge after CI passes; never push to `main`; never `--admin`.

## Roles

| Role | Tool | Branch prefix | Authority |
|------|------|---------------|-----------|
| **Default coding agent** | Cursor | `agent-cursor-*` | Architecture, ownership, review, **PR creation**; no direct push to `main` |
| **Optional worker** | Codex | `agent-codex-*` | Scoped edits only when Cursor delegates; push branch; **no PR, no merge** |
| **Human** | You | any `agent-*` | Merge via PR UI after checks |

Full playbook: [docs/AI_AGENT_WORKFLOW.md](docs/AI_AGENT_WORKFLOW.md)  
CI & protection: [docs/CI_CD.md](docs/CI_CD.md)

---

## Cursor — default agent responsibilities

- **Implement by default** on `agent-cursor-*` — do not offload routine coding to Codex.
- **Classify every task**; default to **cursor-only** unless Codex delegation is narrowly justified.
- **Own architecture and file ownership** — decide what Codex may touch; enforce Cursor-owned paths.
- **Optional:** create `agent-codex-*` only with a tight brief and Codex-safe scope.
- **Review all Codex output** before any merge (diff, risks, scope); fix on `agent-cursor-*` when needed.
- Run checks locally when possible: `npm run lint`, `npm run typecheck`, `npm run build`.
- **Always open PRs** with `./scripts/open-agent-pr.sh "[cursor] …"` — including PRs that contain Codex commits.
- Write risk summary and rollback notes; read the automated PR summary comment.
- Report PR link, checks, and auto-merge status — do not ask for routine manual merges.
- **Do not bypass** branch protection or push to `main`.
- Coordinate with human on production deploys after merge to `main`.

---

## Codex — optional worker (when Cursor delegates)

Codex is **not** the default agent. Use it only when Cursor assigns a **small, isolated** task.

- Work **only** on the branch Cursor named (e.g. `agent-codex-onboarding-consent`).
- Stay inside the brief — no scope creep, no architecture changes, no unrelated refactors.
- Commit with prefix **`[codex]`**; push the branch.
- **Do not open PRs**, **do not merge**, **do not push to `main`**.
- **Do not change** Cursor-owned paths (`middleware.ts`, auth, env, `app/api/*`, migrations, workflows, etc.) unless the brief explicitly allows each file.
- Hand off to Cursor: **files changed**, **commands run**, **remaining risks**.
- Cursor reviews and **creates the PR** — Codex never substitutes for Cursor’s final authority.

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
| Start task (default) | `./scripts/start-agent-task.sh cursor <feature>` |
| Start Codex (optional) | `./scripts/start-agent-task.sh codex <feature>` — Cursor delegates only |
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
