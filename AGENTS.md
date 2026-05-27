# AI agents — Visual Era

Read this file first.

## The stack (final model)

| Tool | Role |
|------|------|
| **ChatGPT Desktop** | Primary orchestrator — plans live via Work with Apps |
| **Cursor** | Default local lead engineer — implements, owns repo consistency |
| **Codex Cloud** | Heavy-lift worker for large isolated jobs (`agent-codex-*`) |
| **Codex IDE panel** | Local review, fixes, finishing touches (Cursor-supervised) |
| **GitHub + CI** | Release gate — PR, checks, auto-merge; **main** protected |
| **Grok** | Optional innovation reviewer only — no repo access |

**Hub:** [docs/INDEX.md](docs/INDEX.md) · [docs/agents/ROSTER.md](docs/agents/ROSTER.md) · [docs/CHATGPT_CURSOR_CODEX_STACK.md](docs/CHATGPT_CURSOR_CODEX_STACK.md) · Workspace: [docs/ops/LOCAL_WORKSPACE_STRATEGY.md](docs/ops/LOCAL_WORKSPACE_STRATEGY.md)

**Repo scope:** Visual Era product only (`Vera-Platforms/vera`). Open Cursor on this repo root. One domain agent per chat — [docs/agents/DISPATCHER.md](docs/agents/DISPATCHER.md).

## Golden rules

1. **Never push directly to `main`** — branch protection blocks it.
2. **All work on `agent-<agent>-<feature>` branches** — e.g. `agent-cursor-my-feature`.
3. **All production changes merge via pull request** — CI + Vercel checks must pass.
4. **One writer per branch** — do not let Cursor and Codex edit the same branch concurrently.
5. **Do not bypass CI** — no force-merge, no admin bypass for agent work.
6. **Batch local work** — iterate on an agent branch; **open a PR only when the unit is ready to ship**.

Optional later: require human approval (`required_approving_review_count: 1`) in branch protection.

## Local iteration vs ship

| Phase | When | Commands |
|-------|------|----------|
| **Iterate** | Every commit while building a feature | `agent-quick-check.sh` (often) |
| **Ship** | Complete unit ready for review/merge | `agent-finish.sh` (once) |

- **No PR required** for every small local tweak — commit on `agent-cursor-*` (or `agent-codex-*` for cloud slices).
- **Push** to origin when you want backup or handoff; still no PR until ship.
- **`agent-finish.sh`** pushes (if needed), opens PR, enables auto-merge — use **only when ready**.

**CI runs on the PR** — avoid opening the PR until the branch is a coherent unit.

## Cursor automation (mandatory)

| When | Command |
|------|---------|
| Start task (default) | `./scripts/start-agent-task.sh cursor <feature-slug>` |
| While iterating | `./scripts/agent-quick-check.sh` |
| Delegate Codex Cloud | `./scripts/delegate-codex-cloud.sh <feature-slug>` |
| Codex branch only | `./scripts/start-agent-task.sh codex <feature-slug>` |
| Before PR (optional) | `./scripts/agent-status.sh --pre-pr` |
| **Ship (PR + auto-merge)** | `./scripts/agent-finish.sh "[cursor] short summary]"` |
| Open PR only | `./scripts/open-agent-pr.sh "[cursor] …"` |
| Wait for merge | `./scripts/open-agent-pr.sh "[cursor] …" --wait` |
| Sync local `main` | `./scripts/sync-main.sh` |
| Manual merge (fallback) | `./scripts/merge-agent-pr.sh <PR_NUMBER>` |

**Never:** work on `main`, push to `main`, bypass protection (`--admin`, `--force`), or force-merge.

### Ship workflow (when ready)

| Step | Command |
|------|---------|
| Verify | `./scripts/agent-quick-check.sh` |
| Optional | `./scripts/agent-status.sh --pre-pr` |
| Ship | `./scripts/agent-finish.sh "[cursor] …"` → PR + auto-merge, exit immediately |

Auto-merge runs **after** PR creation when **CI checks** pass. Vercel preview is not required for merge.

### Auto-merge (default)

`agent-finish.sh` / `open-agent-pr.sh` enable auto-merge and return immediately. GitHub merges when **CI checks** pass.

- **Optional wait:** `--wait` or `MERGE_WAIT_TIMEOUT=120`
- Cursor must **not** ask you to manually merge each PR

### Sync local `main`

`start-agent-task.sh` syncs `main` before new branches. After merge, sync at next task start or `./scripts/sync-main.sh`.

## Authority hierarchy

```text
Human (override)
    ↓
ChatGPT Desktop (orchestrate, plan, briefs — Work with Apps)
    ↓
Cursor local (agent-cursor-* — implement, consistency, review, PR)
    ↓ optional
Codex Cloud (agent-codex-* — large isolated jobs; no PR)
    ↓
Codex IDE panel (review / finish — Cursor-supervised)
    ↓
GitHub + CI → main (protected)
Grok → ideas only → ChatGPT → Cursor (never direct to repo)
```

| Role | Tool | Authority |
|------|------|-----------|
| **Human** | You | Override; high-risk approval |
| **Orchestrator** | ChatGPT Desktop | Plan, classify, delegate; no merge |
| **Lead engineer** | Cursor | `agent-cursor-*`, repo consistency, **PR**, review |
| **Heavy-lift worker** | Codex Cloud | `agent-codex-*`, scoped brief; push only |
| **Local reviewer** | Codex IDE panel | Polish under Cursor |
| **Innovator** | Grok | Product/UX ideas only |
| **Release gate** | GitHub + CI | Required checks; no AI bypass |

**Cursor always owns:** architecture, ownership, final review, **PR creation**, risk notes, merge path.

**Codex Cloud never:** opens PRs, merges, deploys, touches secrets/auth architecture without Cursor review.

## When to use Codex Cloud

See [CODEX_CLOUD_WORKFLOW.md](docs/CODEX_CLOUD_WORKFLOW.md).

| Use Codex Cloud | Keep on Cursor local |
|-----------------|----------------------|
| Large refactors (scoped) | Auth, middleware, `app/api/*` |
| Multi-file cleanup | Env, migrations, Vercel/prod |
| Test generation | Product/UX judgment |
| Isolated feature builds | Unclear scope |
| Repetitive migration work | PR / merge decisions |
| Broad analysis → one briefed slice | Secrets, payments |

## Classifications (Cursor reports at task start)

| Class | When | Who codes |
|-------|------|-----------|
| **cursor-only** (default) | Normal features, fixes, review, PR | Cursor on `agent-cursor-*` |
| **codex-cloud** | Large isolated job with brief | Codex Cloud on `agent-codex-*`; Cursor reviews + ships PR |
| **codex-assisted** | Small scoped slice (local or cloud) | Codex on `agent-codex-*`; Cursor reviews + ships PR |

## Ownership locking (Cursor vs Codex)

| Cursor-owned | Codex-safe (with brief + review) |
|--------------|----------------------------------|
| Architecture, `middleware.ts` | Isolated UI components |
| Auth, `app/api/*`, `lib/env.ts`, `lib/didit.ts` | Tests, utilities |
| Migrations, Vercel/prod, workflows | Docs (non-deploy), repetitive edits |

`./scripts/agent-status.sh --pre-pr` flags Cursor-owned paths.

## Default workflow

1. **ChatGPT Desktop** — scope, brief, classify (cursor-only vs codex-cloud).
2. `./scripts/start-agent-task.sh cursor <slug>` — iterate locally; `agent-quick-check.sh` often.
3. Optional: `./scripts/delegate-codex-cloud.sh <slug>` for heavy lifts.
4. Review cloud work; Codex IDE panel for finishing touches.
5. When unit is ready: `agent-finish.sh` → PR → CI → auto-merge.

Mobile/issues: [MOBILE_AI_TASK_WORKFLOW.md](docs/MOBILE_AI_TASK_WORKFLOW.md) · Prompts: [docs/prompts/](docs/prompts/)

## Prohibited behavior

| Agent | Must NOT |
|-------|----------|
| **Grok** | Edit repo, merge, deploy, secrets |
| **Codex Cloud** | Open PRs, merge, deploy, own architecture |
| **ChatGPT** | Claim merge/deploy authority |
| **Cursor** | Bypass protection, push to `main`, force-merge |

Full playbook: [docs/AI_AGENT_WORKFLOW.md](docs/AI_AGENT_WORKFLOW.md) · CI: [docs/CI_CD.md](docs/CI_CD.md)

---

## Cursor — lead engineer

- Implement on `agent-cursor-*` by default.
- **Batch commits** during iteration; ship with `agent-finish.sh` when complete.
- Classify tasks; delegate large isolated work to Codex Cloud.
- Review all Codex output; use Codex IDE panel for polish.
- **Only Cursor** runs `agent-finish.sh` / opens PRs.
- Do not push to `main`.

## Codex Cloud — heavy-lift worker

- `./scripts/delegate-codex-cloud.sh <slug>` — see [CODEX_CLOUD_WORKFLOW.md](docs/CODEX_CLOUD_WORKFLOW.md).
- Branch `agent-codex-*` only; `[codex]` commits; push; **no PR**.
- Hand off to Cursor for review and ship.

## Commit messages

```text
[cursor] …
[codex] …
[docs] …
[system] …
```

## Quick commands

| Action | Command |
|--------|---------|
| Start task | `./scripts/start-agent-task.sh cursor <feature>` |
| Quick check (iterate) | `./scripts/agent-quick-check.sh` |
| Delegate Codex Cloud | `./scripts/delegate-codex-cloud.sh <feature>` |
| **Ship PR** | `./scripts/agent-finish.sh "[cursor] title"` |
| Issue intake | `./scripts/ai-issue-intake.sh` / `start-ai-issue-task.sh` |
| Agent status | `./scripts/agent-status.sh` |
| Sync `main` | `./scripts/sync-main.sh` |

## Automation (GitHub)

Required on `main`: **CI checks**. Branch naming enforced on PRs.

## Project context

- Next.js 15, Clerk, Supabase, Didit, Vercel.
- Production: `https://visual-era.com` (Vercel alias: `https://visual-era.vercel.app`)
- Sensitive: `middleware.ts`, `lib/didit.ts`, `lib/env.ts`, `app/api/*`

See [docs/COLLABORATION.md](docs/COLLABORATION.md) · Enterprise API access: [docs/ENTERPRISE_AUTOMATION_ACCESS.md](docs/ENTERPRISE_AUTOMATION_ACCESS.md) · Platform agents: [docs/PLATFORM_AGENT_ARCHITECTURE.md](docs/PLATFORM_AGENT_ARCHITECTURE.md).

**GitHub (repo):** [`natew-dev/vera`](https://github.com/natew-dev/vera) · connections reset: [docs/ops/POST_MIGRATION_CONNECTIONS.md](docs/ops/POST_MIGRATION_CONNECTIONS.md) · domain: [docs/ops/CUSTOM_DOMAIN_SETUP.md](docs/ops/CUSTOM_DOMAIN_SETUP.md)

## Platform agents (Cursor dispatches)

Cursor stays lead engineer. For infra checks, delegate to **platform agents** (scripts + MCP read) — see [PLATFORM_AGENT_ARCHITECTURE.md](docs/PLATFORM_AGENT_ARCHITECTURE.md).

| Phase | What |
|-------|------|
| Read-only | `./scripts/ops/run-phase2-verify.sh` before infra-adjacent ships |
| Delegate | [docs/prompts/platform-agent-task.md](docs/prompts/platform-agent-task.md) |

Safest agents first: GitHub → Vercel → Supabase → Resend → Cloudflare → Clerk (restricted). No daemons; no tokens in repo.
