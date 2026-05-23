# AI agents — Visual Era

Read this file first. **Cursor is the default coding agent** for this repo — it plans, implements, reviews, and opens PRs. **ChatGPT-style orchestration** is the authoritative workflow model for planning and filtering work before code. **Grok** is optional for innovation/product review only (no repo access). **Codex is optional**: use it only for isolated, clearly scoped tasks when Cursor delegates. Cursor keeps **final authority** over architecture, file ownership, review, and PR creation.

**AI operating model:** [docs/AI_OPERATING_MODEL.md](docs/AI_OPERATING_MODEL.md) · Grok lane: [docs/GROK_REVIEW_MODEL.md](docs/GROK_REVIEW_MODEL.md) · Task flow: [docs/AI_TASK_FLOW.md](docs/AI_TASK_FLOW.md) · **Mobile tasks:** [docs/MOBILE_AI_TASK_WORKFLOW.md](docs/MOBILE_AI_TASK_WORKFLOW.md) · **Codex cloud:** [docs/CODEX_CLOUD_DELEGATION.md](docs/CODEX_CLOUD_DELEGATION.md)

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
| Codex cloud delegation | `./scripts/delegate-codex-cloud.sh <feature-slug>` — branch + brief + cloud prompt |
| Fast local check | `./scripts/agent-quick-check.sh` (lint + typecheck, no build) |
| Before PR (optional) | `./scripts/agent-status.sh --pre-pr` |
| Finish task (fast) | `./scripts/agent-finish.sh "[cursor] short summary"` — push + PR, no wait |
| Open PR (+ auto-merge) | `./scripts/open-agent-pr.sh "[cursor] …"` (exits immediately by default) |
| Wait for merge | `./scripts/open-agent-pr.sh "[cursor] …" --wait` |
| Sync local `main` | `./scripts/sync-main.sh` (next task start syncs automatically) |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |

**Never:** work on `main`, push to `main`, bypass protection (`--admin`, `--force`), or force-merge.

### Fast workflow (default)

Optimize for **short agent turns**, not blocking on GitHub:

| Step | Fast command | Why |
|------|----------------|-----|
| Start | `./scripts/start-agent-task.sh cursor <feature>` | Quiet sync of `main` |
| While coding | `./scripts/agent-quick-check.sh` | Parallel lint + typecheck (~seconds), skip local `npm run build` |
| Ship | `./scripts/agent-finish.sh "[cursor] …"` | Push + PR + auto-merge, **exit immediately** |
| Next task | `start-agent-task` syncs `main` | Picks up merged work |

**CI runs once per PR** (not on every push to `agent-*`). Open the PR when the branch is ready — avoid pushing 5 times before `agent-finish`.

**CI tiers:** docs-only (~15s) → config/scripts (lint + typecheck, no build) → app code (full build).

### Auto-merge (default)

`open-agent-pr.sh` / `agent-finish.sh` enable auto-merge and **return immediately** (no 2-minute poll). GitHub merges when **CI checks** pass.

- **Optional wait:** `--wait` or `MERGE_WAIT_TIMEOUT=120` to poll and sync `main`.
- **Vercel preview** and PR summary bot are **not** required for merge.
- Cursor must **not** ask you to manually merge each PR.

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

**Optional Codex (only when Cursor delegates):** isolated tests, utility scripts, repetitive edits, docs cleanup (non-deploy), or a **single** clearly bounded fix in Codex-safe paths — with a written brief from Cursor. **Cloud:** run the worker in **Cursor Cloud** or **OpenAI Codex** on `agent-codex-*`; Cursor local reviews and opens the PR ([CODEX_CLOUD_DELEGATION.md](docs/CODEX_CLOUD_DELEGATION.md)).

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
3. **Optional Codex (local or cloud):** `./scripts/delegate-codex-cloud.sh <slug>` or `start-agent-task.sh codex <slug>`; worker commits `[codex]` and pushes; **does not open the PR**.
4. Cursor reviews the diff (and patches on `agent-cursor-*` if needed).
5. **Cursor** opens the PR: `./scripts/open-agent-pr.sh "[cursor] …"` — always, including after Codex/cloud work.
6. Auto-merge after CI passes; never push to `main`; never `--admin`.

## Authority hierarchy

```text
Human (override) → ChatGPT orchestration (plan/filter) → Cursor execution (code/PR)
Grok → briefs only → ChatGPT filter → Cursor (never direct to repo)
Codex → delegated helper → Cursor review → Cursor opens PR
GitHub + CI → merge gate (no AI bypass)
```

| Role | Tool | Repo access | Authority |
|------|------|-------------|-----------|
| **Human** | You | PR merge, production | Override any agent; high-risk approval |
| **Orchestrator** | ChatGPT | None (pasted context) | Architecture, plans, risk, Grok filtering |
| **Default executor** | Cursor | `agent-cursor-*` | Implementation, review, **PR creation** |
| **Innovator** | Grok | None | UX/product ideas; **no edit, merge, deploy** |
| **Optional helper** | Codex / Cursor Cloud | `agent-codex-*` when delegated | Scoped edits in cloud or local; **no PR, no merge** |

**No autonomous production control** — no agent pushes to `main`, force-merges, modifies secrets, or runs infinite loops.

## Default workflow

1. Human goal (or mobile ChatGPT issue, or Grok idea → **ChatGPT filter** first).
2. **From GitHub issue:** `./scripts/ai-issue-intake.sh <n>` → `./scripts/start-ai-issue-task.sh <n>`
3. **Or ad hoc:** `./scripts/start-agent-task.sh cursor <feature-slug>`
4. Implement → `./scripts/agent-quick-check.sh`
5. `./scripts/agent-finish.sh "[cursor] …"` → PR + auto-merge when CI passes (includes `Closes #n` when started from issue)
6. Optional review paste: `./scripts/ai-review-summary.sh` · status: `./scripts/ai-task-status.sh`

Prompt templates: [docs/prompts/](docs/prompts/). Mobile: [docs/MOBILE_AI_TASK_WORKFLOW.md](docs/MOBILE_AI_TASK_WORKFLOW.md).

## Roles (branch workflow)

| Role | Tool | Branch prefix | Authority |
|------|------|---------------|-----------|
| **Default coding agent** | Cursor | `agent-cursor-*` | Architecture, ownership, review, **PR creation**; no direct push to `main` |
| **Optional worker** | Codex | `agent-codex-*` | Scoped edits only when Cursor delegates; push branch; **no PR, no merge** |
| **Human** | You | any `agent-*` | Merge via PR UI after checks |

### Prohibited behavior

| Agent | Must NOT |
|-------|----------|
| **Grok** | Edit repo, merge PRs, deploy, modify secrets, change auth/security/payments directly, run autonomous loops |
| **Codex** | Own architecture, open production PRs independently, modify Cursor-owned paths without Cursor review |
| **Cursor** | Bypass branch protection, push to `main`, `--admin` merge, force merge |

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

Codex is **not** the default agent. Use it only when Cursor assigns a **small, isolated** task — locally, in **Cursor Cloud**, or via **OpenAI Codex**, all on the same branch rules.

- Prepare cloud/local delegation: `./scripts/delegate-codex-cloud.sh <feature-slug>` ([docs/CODEX_CLOUD_DELEGATION.md](docs/CODEX_CLOUD_DELEGATION.md)).
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
| Delegate Codex cloud | `./scripts/delegate-codex-cloud.sh <feature>` |
| Start Codex branch | `./scripts/start-agent-task.sh codex <feature>` |
| Quick check | `./scripts/agent-quick-check.sh` |
| Finish (push + PR) | `./scripts/agent-finish.sh "[cursor] short title"` |
| Issue intake | `./scripts/ai-issue-intake.sh` or `… <issue#>` |
| Start from issue | `./scripts/start-ai-issue-task.sh <issue#>` |
| Setup issue labels | `./scripts/setup-ai-issue-labels.sh` |
| Open PR only | `./scripts/open-agent-pr.sh "[cursor] short title"` |
| Wait for merge | `open-agent-pr.sh "…" --wait` |
| Agent status | `./scripts/agent-status.sh` |
| AI task status | `./scripts/ai-task-status.sh` |
| Review paste (Grok/ChatGPT) | `./scripts/ai-review-summary.sh` |
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

### GitHub issue labels (mobile AI tasks)

| Label | Use |
|-------|-----|
| `ai-task` | Structured AI/mobile pipeline task |
| `mobile-task` | From phone ChatGPT workflow |
| `grok-idea` | Grok origin — needs triage |
| `cursor-accepted` | OK to run `start-ai-issue-task.sh` |
| `cursor-deferred` / `cursor-rejected` | Do not start |
| `high-risk` / `low-risk` | Risk tier |
| `product`, `ux`, `bug`, `enhancement` | Scope |

Create with `./scripts/setup-ai-issue-labels.sh`. See [docs/MOBILE_AI_TASK_WORKFLOW.md](docs/MOBILE_AI_TASK_WORKFLOW.md).

---

## Project context

- Next.js 15 App Router, Clerk, Supabase, Didit, Vercel.
- Production: `https://visual-era.vercel.app` (not raw `visual-*-motivmias-projects.vercel.app` deployment URLs — see [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md))
- Sensitive areas: `middleware.ts`, `lib/didit.ts`, `lib/env.ts`, `app/api/*`

See also [docs/COLLABORATION.md](docs/COLLABORATION.md) for collision avoidance between agents.

---

## Cursor Cloud agents (Codex cloud delegation)

Cloud agents run in Cursor-hosted VMs (Desktop agent → **Cloud**, or [cursor.com/agents](https://cursor.com/agents)). They are **workers only** — same rules as local Codex on `agent-codex-*`.

**Configured in repo:** `.cursor/environment.json` (`npm ci` before each cloud run).

**Delegate a task:**

```bash
./scripts/delegate-codex-cloud.sh <feature-slug>   # branch + brief
# edit .agent/delegation/codex-<slug>.md, commit, push
./scripts/delegate-codex-cloud.sh <feature-slug> --print-only   # cloud prompt
```

**After cloud worker pushes:** Cursor local checks out the branch, runs `agent-status.sh --pre-pr`, reviews, then **`agent-finish.sh`** (Cursor opens PR; cloud worker does not).

Full guide: [docs/CODEX_CLOUD_DELEGATION.md](docs/CODEX_CLOUD_DELEGATION.md) · prompt: [docs/prompts/codex-cloud-delegation.md](docs/prompts/codex-cloud-delegation.md).
