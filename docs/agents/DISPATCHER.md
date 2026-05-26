# Task dispatcher — which agent?

Use this in ChatGPT or manually before opening Cursor.

---

## Symptom → agent

| You need to… | Agent |
|--------------|-------|
| Fix consent flow, redirects, PDF signing, document APIs | **vera-onboarding** |
| Fix DIDIT session, webhook, verification status | **vera-identity** |
| Fix sign-in, handshake, `/__clerk` proxy, middleware | **vera-clerk** |
| Migrations, RLS, schema drift, `types/database.ts` | **vera-supabase** |
| Deploy failed, env vars, domain, Vercel project | **vera-vercel** |
| CI, branch protection, agent scripts, workflows | **vera-github** |
| Run verify scripts, DNS/email/Clerk drift report | **vera-platform-verify** |
| Docs only, AGENTS.md, INDEX, ops writeups | **vera-docs** |

---

## Risk

| Path / topic | Extra gate |
|--------------|------------|
| `middleware.ts`, webhooks, `lib/env.ts`, `lib/security.ts` | Human skim PR; label `risk:high` |
| Remote Supabase apply | **Human-only** after migration PR merges |
| Clerk Dashboard webhook URL | **Human-only** |

---

## Paste into Cursor

1. Pick agent from [ROSTER.md](./ROSTER.md)
2. Copy matching file from [prompts/](prompts/)
3. Fill [cursor-implementation-intake.md](../prompts/cursor-implementation-intake.md)
4. `./scripts/start-agent-task.sh cursor <slug>`

---

## Not in this repo

Planning, council, or multi-repo orchestration — use your separate tools/projects; paste **text briefs only** into vera Cursor.
