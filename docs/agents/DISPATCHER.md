# Task dispatcher — which agent?

All onboarding website work → **vera-website**.

| You need to… | Agent |
|--------------|-------|
| Onboarding UX, DIDIT, documents, sign-in flow, public pages | **vera-website** |
| Dashboard / product app (later) | **vera-product** (not started) |

**Prompt:** [prompts/vera-website.md](./prompts/vera-website.md) · **Decisions:** [DECISIONS.md](../DECISIONS.md)

---

## Workflow

1. `./scripts/start-agent-task.sh cursor <slug>`
2. Implement on `agent-cursor-web-*`
3. `./scripts/agent-quick-check.sh`
4. `./scripts/agent-finish.sh "[cursor] …"` when ready

---

## High-risk paths

| Path | Gate |
|------|------|
| `middleware.ts`, webhooks, `lib/env.ts` | Explicit human request + PR skim |
| Remote Supabase apply | Human-only |
