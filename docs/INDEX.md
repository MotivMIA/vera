# Documentation index — Visual Era

**Start here:** [SETUP.md](./SETUP.md) · [STRATEGIC_PLAN.md](./STRATEGIC_PLAN.md)

---

## Tier 1 — product & build

| Doc | Purpose |
|-----|---------|
| [STRATEGIC_PLAN.md](./STRATEGIC_PLAN.md) | What we build now vs later |
| [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) | Phases, milestones, current work |
| [DECISIONS.md](./DECISIONS.md) | Current constraints & rejected approaches |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, auth, DIDIT, Supabase |
| [CODEBASE_MAP.md](./CODEBASE_MAP.md) | Routes, APIs, file map |
| [SETUP.md](./SETUP.md) | Local dev, Vercel, platform setup |
| [.env.example](../.env.example) | Environment variable template |
| [AGENTS.md](../AGENTS.md) | Branch rules, ship scripts |
| [docs/agents/prompts/vera-website.md](./agents/prompts/vera-website.md) | Implementation agent prompt |
| [CI_CD.md](./CI_CD.md) | Branch protection, CI |

---

## Tier 1 — production & ops

| Doc | Purpose |
|-----|---------|
| [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) | Production URL, Clerk proxy, deploy |
| [OPERATIONAL_IDENTITY.md](./OPERATIONAL_IDENTITY.md) | Orgs, commit email, accounts |
| [ops/CLERK_PROXY_SETUP.md](./ops/CLERK_PROXY_SETUP.md) | Production Clerk `/__clerk` proxy (required for live site) |
| [ops/CLERK_SOCIAL_X.md](./ops/CLERK_SOCIAL_X.md) | Enable X (Twitter) sign-in / sign-up in Clerk |
| [ops/LOCAL_ENV.md](./ops/LOCAL_ENV.md) | `.env` + Vercel import |
| [ops/AGENT_FULL_ACCESS_SETUP.md](./ops/AGENT_FULL_ACCESS_SETUP.md) | Cursor MCP + CLI access |
| [ops/LOCAL_WORKSPACE_STRATEGY.md](./ops/LOCAL_WORKSPACE_STRATEGY.md) | Clone path, verification |
| [ops/POST_MIGRATION_CONNECTIONS.md](./ops/POST_MIGRATION_CONNECTIONS.md) | Dashboard reconnect checklist |
| [ops/OPEN_OPS_ISSUES.md](./ops/OPEN_OPS_ISSUES.md) | Human-only ops tracker |

---

## Tier 2 — workflow & prompts

| Doc | Purpose |
|-----|---------|
| [CHATGPT_CURSOR_CODEX_STACK.md](./CHATGPT_CURSOR_CODEX_STACK.md) | Tool stack |
| [AI_OPERATING_MODEL.md](./AI_OPERATING_MODEL.md) | Governance |
| [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md) | Full agent playbook |
| [prompts/cursor-implementation-intake.md](./prompts/cursor-implementation-intake.md) | Paste brief → implement |

---

## Tier 3 — historical

| Doc | Purpose |
|-----|---------|
| [GITHUB_REPO_MIGRATION.md](./GITHUB_REPO_MIGRATION.md) | **Do not follow** |
| [ops/GITHUB_ORG_MIGRATION.md](./ops/GITHUB_ORG_MIGRATION.md) | Completed transfer record |
| [ops/REPO_RESTRUCTURE_AUDIT.md](./ops/REPO_RESTRUCTURE_AUDIT.md) | 2026 audit |

---

## Database

| Doc | Purpose |
|-----|---------|
| [SUPABASE_SCHEMA.md](../SUPABASE_SCHEMA.md) | Schema reference |
| `supabase/migrations/` | Versioned migrations |
