# Current decisions & constraints

Single source of truth for **how we work now**. Supersedes older multi-agent docs where they conflict.

**Last updated:** 2026-05-28

---

## Product scope

| Decision | Detail |
|----------|--------|
| **This repo = onboarding website only** | Public flow through success; no dashboard product |
| **Product app deferred** | `app/dashboard/**` and vera-product agent come later |
| **No ai-ops in repo** | Planning/council live outside; paste text briefs only |

---

## Repository & release

| Decision | Detail |
|----------|--------|
| **GitHub** | [natew-dev/vera](https://github.com/natew-dev/vera) (private) |
| **Production URL** | https://visual-era.com |
| **Never push to `main`** | PR + CI required |
| **Branch naming** | `agent-cursor-web-<slug>` for website work |
| **One writer per branch** | No concurrent Cursor + Codex on same branch |

---

## Agent model

| Decision | Detail |
|----------|--------|
| **One implementation agent** | **vera-website** (this chat / dedicated Cursor chat) |
| **No multi-domain agents** | Removed vera-clerk, vera-identity, etc. |
| **No SDK auto-dispatch** | No programmatic spawning of multiple Cursor chats |
| **Optional planning** | ChatGPT or brief doc before coding — not required for tiny fixes |
| **Codex Cloud** | Optional heavy lifts; Cursor reviews and opens PRs |

Prompt: [agents/prompts/vera-website.md](./agents/prompts/vera-website.md)

---

## vera-website guardrails

Do **not** change unless the human explicitly requests:

- `middleware.ts`
- Clerk webhook logic (`app/api/webhooks/clerk/**`, `lib/clerk/**`)
- `supabase/migrations/**`, schema files
- Global env / CI / Vercel project config
- `app/dashboard/**` (except minimal post-onboarding handoff link)

---

## Environment

| Decision | Detail |
|----------|--------|
| **Local secrets** | `.env.dev` + `.env.prod` (gitignored); legacy `.env` still works |
| **Template** | `.env.dev.example` / `.env.prod.example` |
| **Local site URL** | `http://localhost:3001` |
| **Production site URL** | `https://visual-era.com` on Vercel only |
| **Dev bypass** | `ALLOW_DEV_AUTH_BYPASS=true` local only; never on Vercel Production |
| **MCP tokens** | `.cursor/mcp.env` (gitignored) — GitHub MCP etc.; not app keys |
| **Vercel sync** | `npm run vercel:sync-env` adds missing keys from `.env` |

---

## Clerk & DIDIT

| Decision | Detail |
|----------|--------|
| **Clerk proxy** | Same-origin `/__clerk` — required |
| **After sign-in/up** | `/onboarding/consent` |
| **DIDIT** | Embedded verification; webhooks to our API routes |
| **No ID images in Supabase** | DIDIT owns document capture |

---

## Phases (summary)

| Phase | Status |
|-------|--------|
| 0 — Ops gates | Complete |
| 1 — Foundation (webhook, tests, repo) | Complete |
| 2 — Onboarding product build | **Current** |
| 3 — Launch polish | Next |
| 4 — Product app | Deferred |

Details: [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md)

---

## Explicitly rejected (for now)

- Multi-agent domain roster for every PR
- Cursor SDK runner to “activate” agents automatically
- Building dashboard/Inflow app before onboarding ships
- Storing production secrets in chat or git

---

## When to update this file

- Scope change (e.g. start dashboard work)
- New hard guardrail for vera-website
- Repo or production URL change
- Phase completion
