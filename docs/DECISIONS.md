# Current decisions & constraints

Single source of truth for **how we work now**. Supersedes older multi-agent docs where they conflict.

**Last updated:** 2026-06-01

---

## Product scope

| Decision | Detail |
|----------|--------|
| **This repo = onboarding website only** | Public flow through success; no dashboard product |
| **Product app deferred** | `app/(dashboard)/**` and vera-product agent come later; **site admin** planned — see [ADMIN_UI.md](./ADMIN_UI.md) |
| **No ai-ops in repo** | Planning/council live outside; paste text briefs only |

### Public surfaces (marketing vs auth)

| Decision | Detail |
|----------|--------|
| **`/` = public marketing** | Informative landing (CRM-style `CrmLandingPage` in progress). Not the Clerk login shell. |
| **`/login` = app login shell** | `AppAuthShell` — branding column + `AuthCard` (hero + auth). Stable URL for “get started”. |
| **`/sign-in`, `/sign-up`** | Same `AppAuthShell` / unified Clerk flow; routes kept for links and Clerk dashboard config. |
| **Legacy OFM page** | `OfmMarketingPage` remains in repo; on **`main`** until CRM landing ships. Do not delete until cutover is merged. |
| **Apex vs product** | **visual-era.com** (apex) = this onboarding + marketing site. “OFM agency site” copy is marketing positioning, not a separate deploy. |
| **Future app host** | Optional **app.visual-era.com** for authenticated app + admin; apex remains marketing. Not required for v1 admin scaffold. |

### Site Admin UI (planned — ADR)

| Decision | Detail |
|----------|--------|
| **Admin on app host, not marketing** | `/admin` under `app/(dashboard)/`, protected by existing middleware matchers — **no** `[locale]/(marketing)/admin` routes |
| **Auth** | Clerk session (dashboard layout) + **site admin** authorization via env allowlist (`SITE_ADMIN_USER_IDS`) and/or Clerk public metadata / org role |
| **Public surface** | Do not link admin from marketing header/footer; no indexed admin pages |
| **Data v1** | File-based i18n + TS config (`messages/*`, `lib/marketing/footer-config.ts`); Supabase settings tables only when vera-product owns migrations |
| **Out of scope v1** | CMS, CRUD media library, middleware drive-by changes, new Clerk apps or webhook shapes |

Full spec: [ADMIN_UI.md](./ADMIN_UI.md) · Roadmap: [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) § Phase 4b.

---

## Repository & release

| Decision | Detail |
|----------|--------|
| **GitHub** | [natew-dev/vera](https://github.com/natew-dev/vera) (private) |
| **Production URL** | https://visual-era.com |
| **Never push to `main`** | PR + CI required |
| **Branch naming** | `agent-cursor-<slug>` or `agent-codex-<slug>` — enforced on PRs ([CI_CD.md](./CI_CD.md), `.github/workflows/branch-naming.yml`). Prompts may suggest `agent-cursor-web-*` as a convention only. |
| **PR #89 (merged 2026-06-01)** | Partial design-system ship: semantic tokens, fluid metrics, `AppAuthShell`, auth/marketing shell polish — see [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) §2b |
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
| **Local secrets** | `.env.local` + `.env.production.local` (gitignored); legacy `.env` still works |
| **Template** | `.env.local.example` / `.env.production.local.example` |
| **Local site URL** | `http://localhost:3001` |
| **Production site URL** | `https://visual-era.com` on Vercel only |
| **Dev bypass** | `ALLOW_DEV_AUTH_BYPASS=true` local only; never on Vercel Production |
| **MCP tokens** | `.cursor/mcp.env` (gitignored) — GitHub MCP etc.; not app keys |
| **Vercel sync** | `npm run vercel:sync-env` adds missing keys from `.env` |

---

## Design system

| Decision | Detail |
|----------|--------|
| **Semantic colors** | Role tokens in `lib/brand/tokens.css`; Tailwind bridge in `app/globals.css` — see [design/COLOR_TOKENS.md](./design/COLOR_TOKENS.md) |
| **Multi-palette (in progress)** | `data-theme` on `<html>`; palettes in `lib/brand/themes/*.css` + `styles/tokens/colors.css`. Default production: `noir-magenta`. Dev-only `ThemeSwitcher` until palette is chosen. |
| **Fluid layout** | Viewport-interpolated type/spacing in `lib/brand/fluid-metrics.css` — see [design/FLUID_METRICS.md](./design/FLUID_METRICS.md) |
| **Landing-specific tokens** | `lib/brand/landing-tokens.css` for CRM landing sections; inherits global semantic tokens |

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
| 4b — Site Admin UI | Planned (scaffold `/admin`; spec in [ADMIN_UI.md](./ADMIN_UI.md)) |

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
