# AI operating model — Visual Era

Lightweight governance for **ChatGPT orchestration**, **Cursor execution**, optional **Grok innovation**, and optional **Codex** helpers — with **GitHub + CI** as the safety layer.

## System overview

```text
You (human)
    ↓
ChatGPT orchestration (plan, validate, mediate)
    ↓
Cursor execution (default coding agent, PRs)
    ↓
GitHub / CI / Vercel validation
    ↓
Production
```

**Innovation lane (optional, no repo access):**

```text
Grok
    ↓
Innovation / review briefs
    ↓
ChatGPT filtering & validation
    ↓
Cursor implementation (agent-cursor-* → PR)
```

**Principles:** Reliability over unchecked autonomy. No AI bypasses branch protection, CI, or deployment safety. No infinite autonomous loops.

**Two intake paths:**

```text
Computer:  ChatGPT Desktop ↔ Cursor (live) → agent branch → PR → CI
Mobile:    ChatGPT/Grok → GitHub Issue → Cursor intake → PR → CI
```

Details: [CHATGPT_DESKTOP_CURSOR_WORKFLOW.md](./CHATGPT_DESKTOP_CURSOR_WORKFLOW.md) · [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md)

## Roles and responsibilities

| Role | Tool | Repo access | Primary job |
|------|------|-------------|-------------|
| **Human** | You | Full (via PR merge) | Goals, approval on high-risk, production judgment |
| **Orchestrator** | ChatGPT (web, mobile, or **Desktop + Work with Apps**) | Read-only / live context | Architecture, plans, risk, Grok filtering; **no merge** |
| **Executor** | Cursor | Branch + PR | Default implementation, review, merge path |
| **Innovator** | Grok | None | UX/product ideas, critique, brainstorming |
| **Helper** | Codex | Branch only when delegated | Scoped edits, tests, utilities |

### ChatGPT (orchestrator)

- System architecture and workflow design
- Implementation planning and task decomposition
- Repo/process governance reasoning
- Risk analysis and deployment reasoning
- Mediation between human, Grok ideas, and Cursor execution
- Validates Grok output before it becomes a Cursor brief
- **Desktop:** live planning, debug, and Cursor prompt drafting via Work with Apps ([guide](./CHATGPT_DESKTOP_CURSOR_WORKFLOW.md))
- **Does not** push code, merge PRs, or hold secrets

### Cursor (default executor)

- All routine coding on `agent-cursor-*`
- PR creation and auto-merge path (`agent-finish.sh`)
- Code review of Codex (and validated Grok-derived) work
- Repo-aware engineering and ownership enforcement
- **Does not** push to `main`, force-merge, or bypass CI

### Grok (innovation / review)

- Product innovation, UX critique, onboarding ideas
- Monetization and strategic suggestions
- Structured review briefs for ChatGPT → Cursor
- **Does not** edit the repo, merge, deploy, or touch secrets/auth/payments directly

### Codex (optional helper)

- Isolated tasks only when Cursor delegates
- Tests, utilities, repetitive edits, scoped bug fixes
- **Does not** own architecture, open production PRs alone, or edit Cursor-owned paths without review

## Communication flow

1. **Human** states goal (desktop session, GitHub issue, chat, or brief).
2. **ChatGPT** classifies risk, scope, and owner; produces an implementation brief if coding is needed.
3. **Grok** (optional) supplies ideas or review — output goes to ChatGPT, not straight to Cursor.
4. **Cursor** runs `./scripts/start-agent-task.sh cursor <slug>`, implements, `./scripts/agent-finish.sh`.
5. **GitHub** runs CI, branch naming, PR summary; auto-merge when green.
6. **Human** spot-checks production for high-risk or user-facing changes.

Paste templates: [docs/prompts/](prompts/). Task flow: [AI_TASK_FLOW.md](./AI_TASK_FLOW.md).

## Repo governance

- **Protected `main`** — all changes via PR
- **Branch pattern:** `agent-<agent>-<feature>` (e.g. `agent-cursor-ai-operating-model`)
- **One writer per branch** — no concurrent Cursor + Codex on same branch
- **Commit prefixes:** `[cursor]`, `[codex]`, `[docs]`, `[system]`
- **Scripts:** `start-agent-task.sh`, `agent-quick-check.sh`, `agent-finish.sh`

See [AGENTS.md](../AGENTS.md) and [CI_CD.md](./CI_CD.md).

## Safe autonomy boundaries

| Allowed | Not allowed |
|---------|-------------|
| Cursor commits on `agent-cursor-*` | Direct push to `main` |
| Auto-merge after **CI checks** pass | `--admin` merge, force push |
| Codex on `agent-codex-*` with brief | Codex opening PRs without Cursor review |
| Grok text briefs / reviews | Grok editing repo or secrets |
| ChatGPT plans and checklists | ChatGPT claiming merge/deploy authority |
| Polling merge status with `--wait` | Background daemons or infinite agent loops |

## Human override authority

The human may at any time:

- Reject or defer any Grok or ChatGPT recommendation
- Require manual merge instead of auto-merge
- Block a PR regardless of CI status
- Change branch protection or required reviews
- Revoke Codex delegation or Grok review for a task

AI agents must treat human instructions as overriding prior plans.

## CI/CD as safety layer

```text
PR opened → branch-naming check → CI checks (lint/typecheck/build tiers) → auto-merge (optional) → Vercel production on main
```

- **Required merge gate:** job **CI checks**
- **Informational:** PR summary bot, Vercel preview comments
- Production deploy follows Vercel promotion of `main` — no agent-triggered production deploy API in this model

## Branch ownership model

| Owner | Branch | Opens PR? |
|-------|--------|-----------|
| Cursor | `agent-cursor-*` | Yes |
| Codex | `agent-codex-*` | No — Cursor opens after review |
| Human | any `agent-*` | Yes |

**Cursor-owned paths** (Codex needs Cursor review if touched): `middleware.ts`, `app/api/*`, `lib/env.ts`, `lib/didit.ts`, auth/security, migrations, `.github/workflows/`, production docs. Enforced by `agent-status.sh --pre-pr`.

## Production safety rules

- No agent modifies production env vars or secrets without human approval
- Clerk, Supabase, Didit, and Vercel settings are **Cursor-only**
- After merge to `main`, validate production for auth/onboarding changes
- Use `npm run smoke:clerk-proxy` after Clerk-related deploys
- Clear site cookies when Clerk proxy/session config changes

## Innovation / review loop

1. Use Grok with [prompts/grok-product-review.md](prompts/grok-product-review.md) or [grok-feature-innovation.md](prompts/grok-feature-innovation.md).
2. ChatGPT filters with [prompts/chatgpt-orchestration-review.md](prompts/chatgpt-orchestration-review.md).
3. Approved items become a Cursor brief via [prompts/cursor-implementation-intake.md](prompts/cursor-implementation-intake.md).
4. Cursor implements on `agent-cursor-*` only.

Details: [GROK_REVIEW_MODEL.md](./GROK_REVIEW_MODEL.md).

## Failure recovery process

| Failure | Action |
|---------|--------|
| CI failed on PR | Cursor fixes on same branch, push, wait for CI |
| Auto-merge disabled | `./scripts/merge-agent-pr.sh <n>` after human review |
| Wrong branch / dirty tree | Stash or commit; `start-agent-task.sh` from clean `main` |
| Codex touched Cursor-owned paths | Cursor review + fix on `agent-cursor-*` before merge |
| Grok scope creep | ChatGPT re-labels; defer or reject — no implementation |
| Production regression | Revert via new PR on `agent-cursor-*`; human confirms Vercel rollback if needed |
| Agent loop / runaway task | Human stops session; no new commits until brief is rewritten |

**Status helpers:** `./scripts/ai-task-status.sh`, `./scripts/ai-review-summary.sh`.

## Related docs

- [AGENTS.md](../AGENTS.md) — agent entry point
- [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md) — scripts and merge lifecycle
- [AI_TASK_FLOW.md](./AI_TASK_FLOW.md) — issues and labels
- [GROK_REVIEW_MODEL.md](./GROK_REVIEW_MODEL.md) — Grok lane
- [CHATGPT_DESKTOP_CURSOR_WORKFLOW.md](./CHATGPT_DESKTOP_CURSOR_WORKFLOW.md) — Desktop Work with Apps + Cursor
- [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md) — phone → issue queue
