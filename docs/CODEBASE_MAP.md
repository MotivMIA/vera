# Visual Era codebase map

Quick orientation for agents and contributors. Stack: **Next.js 15 App Router**, **Clerk** auth, **Supabase** (service role on server), **DIDIT** identity verification, Tailwind + shadcn UI.

## Onboarding flow

| Step | Route | Purpose |
|------|-------|---------|
| Consent | `/onboarding/consent` | Terms, privacy, e-sign acknowledgements → `POST /api/onboarding/consent` |
| Identity | `/verify-identity` | Embedded DIDIT → `POST /api/didit/start`, `GET /api/didit/status`, webhook |
| Documents | `/documents` | Internal signing packet → `POST /api/documents/submit`, status API |
| Complete | `/success` | End state after both documents signed |

Guards: `lib/onboarding/guards.ts` (`enforceOnboardingPath`), snapshot: `lib/onboarding/status.ts`.

Clerk after sign-in/up should point to `/onboarding/consent` (see `.env.example`).

## API routes

- `app/api/didit/start` — start verification (requires consent)
- `app/api/didit/status` — poll session
- `app/api/didit/webhook` — DIDIT callbacks
- `app/api/onboarding/consent` — persist consent timestamps
- `app/api/onboarding/status` — JSON onboarding snapshot
- `app/api/documents/*` — signing workflow

## Libraries

| Path | Role |
|------|------|
| `lib/didit.ts` | DIDIT API client |
| `lib/env.ts` | Env parsing, site URL, production validation |
| `lib/onboarding/audit.ts` | Encrypted audit log writes |
| `lib/onboarding/constants.ts` | Step order, paths, progress % |
| `lib/legal/documents.ts` | Static legal copy |
| `lib/supabase/server.ts` | Admin Supabase client |
| `middleware.ts` | Clerk auth, legacy `/__clerk` redirect |

## UI

- `components/onboarding/*` — consent form, DIDIT embed, documents, shell
- `components/marketing/*` — home hero, auth card, site footer
- `components/legal/legal-document.tsx` — legal page renderer
- `app/legal/[slug]` — public policy pages

## Data model

See `SUPABASE_SCHEMA.md` for `users`, `onboarding_status`, `verification_status`, `signed_documents`, `audit_logs`.

## Agent workflow

- Branch: `agent-cursor-<task>`
- `./scripts/start-agent-task.sh`, `./scripts/agent-quick-check.sh`, `./scripts/agent-finish.sh`
- Docs: `AGENTS.md`, `docs/AGENT_WORKFLOW.md`

## Deploy

- Production: Vercel (`NEXT_PUBLIC_SITE_URL` must match public origin)
- Clerk: hosted Frontend API only (no `/__clerk` proxy)
- Required in production: Clerk keys, site URL, Supabase trio (`lib/env.ts`)
