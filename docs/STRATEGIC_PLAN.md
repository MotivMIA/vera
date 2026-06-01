# Strategic plan — Visual Era

**Product:** Premium creator onboarding for Visual Era  
**Production:** https://visual-era.com  
**Repo:** [natew-dev/vera](https://github.com/natew-dev/vera)  
**Workspace:** `~/Documents/projects/visual-era`

---

## What we are building (now)

A **public onboarding website** — not the full creator management product yet.

| In scope (this repo) | Out of scope (later / other repos) |
|----------------------|-------------------------------------|
| Public marketing at `/` (informative CRM-style landing in progress; OFM page on `main` today) | Full **creator product** dashboard (`/creator` workflows) |
| App login at `/login` (hero + unified Clerk auth card) | Client management, billing, chatter moderation |
| Clerk auth (`/sign-in`, `/sign-up` → same `AppAuthShell`) | “Inflow-style” product application |
| Consent + legal acknowledgements | ai-ops / council / multi-repo planning systems |
| DIDIT identity verification | Auto-orchestrated multi-agent SDK runners |
| In-app document signing | |
| Success handoff (minimal link/redirect only) | |
| **Site admin UI** (planned — spec only until Phase 3) | **Admin implementation** (CRUD, CMS) — see [ADMIN_UI.md](./ADMIN_UI.md) |

**Success metric (Phase 2):** A creator can complete onboarding end-to-end on production with reliable auth, verification, and signed documents.

---

## What we are building (later)

**VERA platform surfaces** (separate phase; **vera-product** agent when started):

| Surface | Route (current plan) | Purpose |
|---------|----------------------|---------|
| Creator app | `/creator` | Performance, content, account tools |
| **Site admin** | `/admin` | Marketing copy, locales, footer/nav, theme default, legal registry |
| Chatter / ops | `/chatter` | Moderation / internal ops (TBD) |

- `app/(dashboard)/**` and product-specific APIs
- Workflows comparable to an internal creator operations tool (“Inflow-style”)
- Optional dedicated host: `app.visual-era.com` for authenticated app + admin (apex stays marketing-only)

Do not expand into full dashboard/product features until onboarding handoff is clean and shipped. **Planning + thin scaffold** for site admin is allowed now — see [ADMIN_UI.md](./ADMIN_UI.md).

---

## Stack (fixed)

| Layer | Choice |
|-------|--------|
| App | Next.js 15 App Router, TypeScript, Tailwind |
| Auth | Clerk (same-origin `/__clerk` proxy) |
| Database | Supabase (service role on server, RLS on) |
| Identity | DIDIT (no raw ID storage in our DB) |
| Hosting | Vercel → **visual-era.com** |
| Release | GitHub `main` protected, PR + CI |

---

## How we work

| Role | Tool |
|------|------|
| Human | Override, high-risk approval |
| Planning (optional) | ChatGPT Desktop or orchestrator brief |
| Implementation | **vera-website** Cursor chat (single agent) |
| Ship | `agent-cursor-*` (or `agent-codex-*`) → PR → CI → merge — see [CI_CD.md](./CI_CD.md) |

See [DECISIONS.md](./DECISIONS.md) · [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) · [AGENTS.md](../AGENTS.md).

---

## Non-goals

- Building the full product app in this phase
- Storing government ID images in Supabase
- Bypassing CI or pushing to `main`
- Committing secrets or planning-system content into this repo

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) | Phases and milestones |
| [ADMIN_UI.md](./ADMIN_UI.md) | Site admin UI spec (planned) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical design |
| [CODEBASE_MAP.md](./CODEBASE_MAP.md) | Routes, APIs, file map |
| [SETUP.md](./SETUP.md) | Local + platform setup |
