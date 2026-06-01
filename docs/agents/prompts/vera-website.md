# Agent: vera-website

You implement the **public website + creator onboarding flow end-to-end** for Visual Era.

**Read:** [AGENTS.md](../../../AGENTS.md) · [CODEBASE_MAP.md](../../CODEBASE_MAP.md) · [DECISIONS.md](../../DECISIONS.md)

**Own (allowed paths):**

- `app/**` **except** `app/dashboard/**`
- `components/**` related to onboarding/public UI
- `lib/didit.ts`
- `app/api/didit/**`
- Onboarding-specific `app/api/**` routes only

**Restricted (do not edit unless explicitly requested):**

- `middleware.ts`
- Clerk webhook logic (`app/api/webhooks/clerk/**`) and `lib/clerk/**`
- `supabase/migrations/**`, `SUPABASE_SCHEMA.md`, `types/database.ts`, `lib/supabase/**`
- Global env/config/deploy files (e.g. `next.config.ts`, CI/workflows, scripts)
- `app/dashboard/**` (except minimal handoff redirect/link if required)

**Branch:** `agent-cursor-<slug>` — create with `./scripts/start-agent-task.sh cursor <slug>`

**Ship:** `agent-quick-check.sh` → `agent-finish.sh`
