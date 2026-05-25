# AI operating model — Visual Era

Governance for the **ChatGPT Desktop → Cursor → Codex Cloud** stack, optional **Grok** ideas, and **GitHub + CI** as the release gate.

**Daily guide:** [CHATGPT_CURSOR_CODEX_STACK.md](./CHATGPT_CURSOR_CODEX_STACK.md)

## System overview

```text
ChatGPT Desktop (orchestrate — Work with Apps)
    ↓
Cursor local (agent-cursor-* — implement, batch iterate)
    ↓ optional
Codex Cloud (agent-codex-* — large isolated jobs)
    ↓
Cursor + Codex IDE panel (review, finish)
    ↓ when unit ready
PR → CI checks → auto-merge → Vercel (main)
```

**Innovation (optional):**

```text
Grok → ChatGPT filter → issue or brief → Cursor / Codex Cloud → PR
```

**Principles:** Reliability over unchecked autonomy. No AI bypasses branch protection or CI. No PR for every tiny local edit — **ship complete units**. No infinite autonomous loops.

## Roles and responsibilities

| Role | Tool | Repo access | Primary job |
|------|------|-------------|-------------|
| **Human** | You | Via PR merge | Goals, override, production judgment |
| **Orchestrator** | ChatGPT Desktop | None (live/pasted context) | Plan, classify, briefs, mediation |
| **Lead engineer** | Cursor | `agent-cursor-*` | Implement, consistency, review, **PR** |
| **Heavy-lift worker** | Codex Cloud | `agent-codex-*` when delegated | Large scoped jobs; push only |
| **Local reviewer** | Codex IDE panel | Local | Polish under Cursor supervision |
| **Innovator** | Grok | None | Product/UX ideas |
| **Release gate** | GitHub + CI | Protected `main` | Required checks before merge |

### ChatGPT Desktop (primary orchestrator)

- Live planning via Work with Apps with Cursor context
- Task classification (cursor-only vs codex-cloud)
- Implementation and delegation briefs
- Grok output filtering
- Risk and deployment reasoning
- **Does not** push code, open PRs, merge, or hold secrets

### Cursor (default local lead engineer)

- Routine and architectural implementation on `agent-cursor-*`
- **Batch local iteration** — multiple commits before PR
- Repo consistency and ownership enforcement
- Review of Codex Cloud output
- **PR creation** and `agent-finish.sh` — sole ship path
- **Dispatcher** for platform agents (GitHub, Vercel, Supabase, Resend, Cloudflare, Clerk, Docs) — see [PLATFORM_AGENT_ARCHITECTURE.md](./PLATFORM_AGENT_ARCHITECTURE.md)
- **Does not** push to `main` or bypass CI
- **Does not** run every infra check itself — delegates read-only scripts (`scripts/ops/`) and MCP reads

### Codex Cloud (heavy-lift worker)

Use for large refactors, multi-file cleanup, test generation, isolated features, repetitive migrations, briefed analysis slices. See [CODEX_CLOUD_WORKFLOW.md](./CODEX_CLOUD_WORKFLOW.md).

- Runs on `agent-codex-*` with written brief
- **Does not** handle secrets, auth architecture, prod deploy, env, payments, unclear product calls
- **Does not** open PRs, merge, or deploy

### Codex IDE panel (local)

- Review diffs, small fixes, finishing touches
- Cursor-supervised; not a separate merge authority

### Grok (optional)

- Innovation and UX critique → ChatGPT → Cursor
- **Does not** touch the repo

## Communication flow

1. **Human** states goal (ChatGPT session, issue, or brief).
2. **ChatGPT Desktop** classifies and produces briefs.
3. **Grok** (optional) → ChatGPT filter only.
4. **Cursor** iterates on `agent-cursor-*`; **Codex Cloud** optional on `agent-codex-*`.
5. **Cursor** reviews; **ship** with `agent-finish.sh` when the unit is complete.
6. **GitHub** CI + auto-merge; Vercel on `main`.

## Local iteration vs ship

| Phase | Scripts | PR? |
|-------|---------|-----|
| Iterate | `agent-quick-check.sh` | No |
| Ship | `agent-finish.sh` | Yes — once per complete unit |

## Repo governance

- Protected `main`; `agent-<agent>-<feature>` branches
- One writer per branch
- Commit prefixes: `[cursor]`, `[codex]`, `[docs]`, `[system]`
- CI job **CI checks** required for merge

See [AGENTS.md](../AGENTS.md), [CI_CD.md](./CI_CD.md).

## Safe autonomy boundaries

| Allowed | Not allowed |
|---------|-------------|
| Many commits before one PR | PR per tiny tweak |
| Codex Cloud on `agent-codex-*` with brief | Codex opening PRs |
| Auto-merge after CI | Force merge, `--admin` |
| ChatGPT planning | ChatGPT merging |

## Human override

Human instructions override any agent plan. Human approves high-risk work.

## CI/CD as safety layer

```text
agent-finish.sh → PR → branch naming + CI checks → auto-merge → production (main)
```

## Platform agents (under Cursor)

| Agent | Role |
|-------|------|
| **GitHub** | Issues, PRs, CI status |
| **Vercel** | Deployments, env key checks |
| **Supabase** | Schema/RLS read; migrations via PR only |
| **Resend** | Domain / DNS alignment |
| **Cloudflare** | DNS, email DNS (restricted) |
| **Clerk** | Redirect/origin checks (restricted) |
| **Docs/Research** | Official docs, no prod API |

Rollout: [PLATFORM_AGENT_ROLLOUT.md](./PLATFORM_AGENT_ROLLOUT.md) · Task template: [prompts/platform-agent-task.md](./prompts/platform-agent-task.md)

## Related docs

- [AGENTS.md](../AGENTS.md)
- [CHATGPT_CURSOR_CODEX_STACK.md](./CHATGPT_CURSOR_CODEX_STACK.md)
- [PLATFORM_AGENT_ARCHITECTURE.md](./PLATFORM_AGENT_ARCHITECTURE.md)
- [ENTERPRISE_AUTOMATION_ACCESS.md](./ENTERPRISE_AUTOMATION_ACCESS.md)
- [CODEX_CLOUD_WORKFLOW.md](./CODEX_CLOUD_WORKFLOW.md)
- [CODEX_CLOUD_DELEGATION.md](./CODEX_CLOUD_DELEGATION.md) — setup & prompts
- [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md)
- [GROK_REVIEW_MODEL.md](./GROK_REVIEW_MODEL.md)
- [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md)
