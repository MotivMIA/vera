# Setup guide — Visual Era

Quick path from zero to running locally and deploying. **Secrets never go in git.**

---

## Prerequisites

- Node.js 20+ (project uses Node 24 on Vercel)
- `npm ci`
- Accounts: GitHub, Vercel, Clerk, Supabase, Didit
- Optional: `gh`, `vercel` CLI

---

## 1. Clone and install

```bash
cd ~/Documents/projects
git clone https://github.com/natew-dev/vera.git visual-era
cd visual-era
npm ci
```

Open **`visual-era`** as the Cursor workspace root (not a parent folder).

---

## 2. Environment variables

```bash
cp .env.example .env
# Fill in Clerk, Supabase, Didit values
npm run env:check
```

| File | Purpose |
|------|---------|
| `.env.example` | Committed template |
| `.env` | Your secrets (gitignored) |

**Local defaults:**

- `NEXT_PUBLIC_SITE_URL=http://localhost:3001`
- `ALLOW_DEV_AUTH_BYPASS=true` (local only)

Full guide: [ops/LOCAL_ENV.md](./ops/LOCAL_ENV.md)

---

## 3. Run locally

```bash
npm run dev
# → http://localhost:3001
npm run dev:smoke   # with dev server running
```

---

## 4. Vercel (production)

```bash
vercel login
vercel link --yes --project visual-era
npm run vercel:sync-env   # push missing keys from .env
```

**Production overrides** (Vercel dashboard or CLI):

- `NEXT_PUBLIC_SITE_URL=https://visual-era.com`
- Do **not** set `ALLOW_DEV_AUTH_BYPASS` on Production

Deploy: merge PR to `main` → Vercel production build.

Details: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

## 5. Platform dashboards (one-time)

| Service | Action |
|---------|--------|
| **Clerk** | Allowed origins: localhost:3001 + visual-era.com; webhook → `/api/webhooks/clerk`; X OAuth → [ops/CLERK_SOCIAL_X.md](./ops/CLERK_SOCIAL_X.md) |
| **Didit** | Webhook URL → production API route (see [CODEBASE_MAP.md](./CODEBASE_MAP.md)) |
| **Supabase** | Run migrations from `supabase/migrations/` (human apply to remote when ready) |

Checklist: [ops/POST_MIGRATION_CONNECTIONS.md](./ops/POST_MIGRATION_CONNECTIONS.md)

---

## 6. Cursor agent (optional automation)

| Step | Doc |
|------|-----|
| Sandbox + auto-run | [ops/CURSOR_SANDBOX_SETUP.md](./ops/CURSOR_SANDBOX_SETUP.md) |
| GitHub / Vercel / Clerk MCP | [ops/AGENT_FULL_ACCESS_SETUP.md](./ops/AGENT_FULL_ACCESS_SETUP.md) |
| Implementation agent | [agents/prompts/vera-website.md](./agents/prompts/vera-website.md) |

---

## 7. Ship a change

```bash
./scripts/start-agent-task.sh cursor <slug>
# … edit …
./scripts/agent-quick-check.sh
./scripts/agent-finish.sh "[cursor] short title"
```

Rules: [AGENTS.md](../AGENTS.md) · [CI_CD.md](./CI_CD.md)

---

## Verify checklist

```bash
npm run env:check
npm run typecheck
npm run lint
npm test
./scripts/agent-quick-check.sh
```

---

## Doc map

| Topic | Doc |
|-------|-----|
| Strategy | [STRATEGIC_PLAN.md](./STRATEGIC_PLAN.md) |
| Roadmap | [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Decisions | [DECISIONS.md](./DECISIONS.md) |
| Index | [INDEX.md](./INDEX.md) |
