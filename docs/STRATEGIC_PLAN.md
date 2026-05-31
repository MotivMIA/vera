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
| Marketing / signup landing | Logged-in **dashboard** (`app/dashboard/**`) |
| Clerk auth (sign-in / sign-up) | Client management, billing, internal tools |
| Consent + legal acknowledgements | “Inflow-style” product application |
| DIDIT identity verification | ai-ops / council / multi-repo planning systems |
| In-app document signing | Auto-orchestrated multi-agent SDK runners |
| Success handoff (minimal link/redirect only) | |

**Success metric (Phase 2):** A creator can complete onboarding end-to-end on production with reliable auth, verification, and signed documents.

---

## What we are building (later)

**Product app** (separate phase, separate agent when started):

- `app/dashboard/**` and product-specific APIs
- Workflows comparable to an internal creator operations tool (“Inflow-style”)

Do not expand into dashboard/product features until onboarding handoff is clean and shipped.

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
| Ship | `agent-cursor-web-*` → PR → CI → merge |

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
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical design |
| [CODEBASE_MAP.md](./CODEBASE_MAP.md) | Routes, APIs, file map |
| [SETUP.md](./SETUP.md) | Local + platform setup |
