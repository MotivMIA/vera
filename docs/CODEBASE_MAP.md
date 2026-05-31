# Visual Era codebase map

Quick orientation for agents and contributors. Stack: **Next.js 15 App Router**, **Clerk** auth, **Supabase** (service role on server), **DIDIT** identity verification, Tailwind + shadcn UI.

Modular layout: see [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md).

## App modules (route groups — URLs unchanged)

| Group | Routes | Folder |
|-------|--------|--------|
| Marketing | `/`, `/legal/*` | `app/(marketing)/` |
| Auth | `/sign-in`, `/sign-up` | `app/(auth)/` |
| Onboarding | `/onboarding/*`, `/verify-identity`, `/documents`, `/success` | `app/(onboarding)/` |
| Dashboard | `/creator` (placeholder) | `app/(dashboard)/` |
| API | `/api/*` | `app/api/` |

## Onboarding flow

| Step | Route | Purpose |
|------|-------|---------|
| Consent | `/onboarding/consent` | Terms, privacy, e-sign acknowledgements → `POST /api/onboarding/consent` |
| Identity | `/verify-identity` | Embedded DIDIT → `POST /api/didit/start`, `GET /api/didit/status`, DIDIT webhook; Clerk → `POST /api/webhooks/clerk` |
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
| `lib/brand/colors.ts` | Logo-aligned brand tokens (CSS mirrors in `globals.css`) |
| `lib/contracts/` | Contract signing constants and types |
| `lib/pdf/` | Signed document PDF generation |
| `lib/dashboard/constants.ts` | Dashboard route placeholders |
| `lib/didit.ts` | DIDIT API client |
| `lib/env.ts` | Env parsing, site URL, production validation |
| `lib/onboarding/audit.ts` | Encrypted audit log writes |
| `lib/onboarding/constants.ts` | Step order, paths, progress % |
| `lib/onboarding/pdf.ts` | Re-export shim → `lib/pdf/` |
| `lib/legal/documents.ts` | Static legal copy |
| `lib/supabase/server.ts` | Admin Supabase client |
| `middleware.ts` | Clerk auth, same-origin `/__clerk` proxy (`frontendApiProxy`) |

## UI

- `components/brand/*` — logo, brand shell
- `components/contracts/*` — internal signing packet
- `components/onboarding/*` — consent form, DIDIT embed, documents shell
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
- Clerk: same-origin `/__clerk` proxy via `lib/clerk/hosted-only.ts` + `frontendApiProxy` in middleware
- Required in production: Clerk keys, site URL, Supabase trio (`lib/env.ts`)
