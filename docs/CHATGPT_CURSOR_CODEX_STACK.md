# ChatGPT + Cursor + Codex stack

Daily workflow for Visual Era — each tool used for what it does best. **GitHub PR + CI** remain the release gate; **main** stays protected.

## The stack

| Tool | Role | Repo access |
|------|------|-------------|
| **ChatGPT Desktop** | Primary orchestrator (Work with Apps) | None — plans, debug, briefs |
| **Cursor** | Default local lead engineer | `agent-cursor-*` — implements, owns consistency |
| **Codex Cloud** | Heavy-lift worker (large isolated jobs) | `agent-codex-*` — pushes only; no PR |
| **Codex IDE panel** | Local review, fixes, finishing touches | Same machine as Cursor |
| **Grok** | Optional innovation reviewer | None — ideas only |
| **GitHub + CI + Vercel** | Safety / governance / production | Merge gate |
| **Platform agents** | Narrow infra checks (API/MCP/scripts) | Cursor dispatches — no merge authority |

```text
ChatGPT Desktop (plan)
    ↓
Cursor local (agent-cursor-* — iterate, batch commits)
    ↓ optional
Codex Cloud (agent-codex-* — large isolated slice)
    ↓
Cursor + Codex panel (review, polish)
    ↓ when unit is ready
PR → CI checks → auto-merge → production
```

## Typical day

### 1. Talk to ChatGPT Desktop

- Use **Work with Apps** with Cursor open for live context.
- Get: scope, acceptance criteria, risk tier, whether to use Codex Cloud.
- Output: a short brief for Cursor (or a delegation brief for Codex Cloud).
- ChatGPT does **not** merge, deploy, or push code.

### 2. Cursor edits locally

```bash
./scripts/start-agent-task.sh cursor <feature-slug>
```

- Implement on `agent-cursor-*`.
- Commit often with `[cursor]` — **no PR yet** for small iterations.
- Run `./scripts/agent-quick-check.sh` while iterating.

### 3. Codex Cloud for heavy lifts (optional)

When the job is large, repetitive, or multi-file but **isolated**:

```bash
./scripts/delegate-codex-cloud.sh <slug>
```

See [CODEX_CLOUD_WORKFLOW.md](./CODEX_CLOUD_WORKFLOW.md).

### 4. Cursor reviews

- Pull `agent-codex-*` if cloud work was used.
- Use **Codex IDE panel** for local review passes, small fixes, and polish on the same branch.
- `./scripts/agent-status.sh --pre-pr` before shipping.

### 5. Platform checks (infra-related work)

Cursor delegates tedious platform work to **platform agents** (read-only Phase 2):

```bash
./scripts/ops/run-phase2-verify.sh
```

Use [prompts/platform-agent-task.md](./prompts/platform-agent-task.md) for scoped tasks. ChatGPT innovation stays in planning; agents execute narrow checks only.

### 6. PR only when ready

Open a PR when the change is a **complete unit** (feature, fix, or doc set) — not every tiny tweak.

```bash
./scripts/agent-quick-check.sh
./scripts/agent-finish.sh "[cursor] short summary"
```

- Creates PR, enables auto-merge.
- CI **CI checks** must pass before merge.
- Vercel deploys from `main` after merge.

### 7. Mobile / async queue

Phone → GitHub Issue → `./scripts/ai-issue-intake.sh` → `./scripts/start-ai-issue-task.sh` — same stack, same ship rules. See [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md).

## Local iteration vs ship

| Phase | What you do | Scripts |
|-------|-------------|---------|
| **Iterate** | Commits on `agent-*` branch; push optional | `agent-quick-check.sh` |
| **Ship** | One PR per complete unit | `agent-finish.sh` → auto-merge after CI |

**Do not** run `agent-finish.sh` for every small edit. Batch related work, then ship once.

## Grok (optional)

- Product/UX ideas only → ChatGPT filters → GitHub issue or Cursor brief.
- Never edits the repo. See [GROK_REVIEW_MODEL.md](./GROK_REVIEW_MODEL.md).

## Authority (non-negotiable)

| Who | Owns |
|-----|------|
| ChatGPT Desktop | Plan, classify, delegate briefs |
| Cursor | Local implementation, repo consistency, **PR creation**, review |
| Codex Cloud | Scoped implementation on `agent-codex-*` only |
| Codex panel | Review / finish — under Cursor supervision |
| GitHub CI | Merge gate |
| Human | Override everything |

Codex Cloud **never** merges, deploys, or opens PRs.

## Related

- [AGENTS.md](../AGENTS.md) — entry point
- [AI_OPERATING_MODEL.md](./AI_OPERATING_MODEL.md) — authority detail
- [PLATFORM_AGENT_ARCHITECTURE.md](./PLATFORM_AGENT_ARCHITECTURE.md) — dispatcher + agents
- [PLATFORM_AGENT_ROLLOUT.md](./PLATFORM_AGENT_ROLLOUT.md) — phases
- [ENTERPRISE_AUTOMATION_ACCESS.md](./ENTERPRISE_AUTOMATION_ACCESS.md) — token scopes
- [CODEX_CLOUD_WORKFLOW.md](./CODEX_CLOUD_WORKFLOW.md) — cloud heavy lifts
- [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md) — scripts and CI lifecycle
