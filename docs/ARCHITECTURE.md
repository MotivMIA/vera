# Architecture — Visual Era onboarding

Technical overview for implementers. File-level map: [CODEBASE_MAP.md](./CODEBASE_MAP.md).

---

## System context

```text
Browser
  → Next.js (Vercel) — App Router, RSC + API routes
  → Clerk (auth, same-origin /__clerk proxy)
  → DIDIT (identity verification, embedded SDK + webhooks)
  → Supabase (Postgres + Storage for signed PDFs)
```

**Canonical production URL:** `https://visual-era.com`  
**Local dev:** `http://localhost:3001` (`npm run dev` → `next dev -p 3001`)

---

## Request flow — onboarding

```text
/  → marketing / signup
/sign-in, /sign-up  → Clerk
/onboarding/consent  → POST /api/onboarding/consent
/verify-identity    → POST /api/didit/start, poll GET /api/didit/status, DIDIT webhook
/documents          → POST /api/documents/submit, status APIs
/success            → terminal state
```

**Guards:** `lib/onboarding/guards.ts` enforces step order via `enforceOnboardingPath`.  
**State:** `lib/onboarding/status.ts` + Supabase tables (see `SUPABASE_SCHEMA.md`).

---

## Auth (Clerk)

- **Middleware:** `middleware.ts` — session, protected routes, **`frontendApiProxy`** for `/__clerk`
- **Why proxy:** Clerk Frontend API host is not on our DNS; same-origin avoids CORS/SSL issues
- **Do not set** `NEXT_PUBLIC_CLERK_PROXY_URL` on Vercel unless changing path
- **Webhooks:** `POST /api/webhooks/clerk` — verify with `CLERK_WEBHOOK_SIGNING_SECRET`

Details: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

## Identity (DIDIT)

- **Client:** `lib/didit.ts`
- **Routes:** `app/api/didit/start`, `status`, `webhook`
- **UI:** `app/verify-identity`, `components/onboarding/*`
- **Policy:** No raw ID images in our database; DIDIT owns capture and verification
- **Secrets:** `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET` (+ optional `_PREVIOUS` for rotation)

---

## Data (Supabase)

| Table / bucket | Role |
|----------------|------|
| `users` | Clerk-linked profile |
| `onboarding_status` | Step progress |
| `verification_status` | DIDIT session state |
| `signed_documents` | Metadata + storage path |
| `audit_logs` | Encrypted audit trail |
| `signed-documents` bucket | Private PDF storage |

Server writes use **`SUPABASE_SERVICE_ROLE_KEY`** only on the server. Migrations: `supabase/migrations/`.

---

## Environment

- **Single local file:** `.env` (gitignored) — see [.env.example](../.env.example)
- **Vercel:** same keys; Production overrides `NEXT_PUBLIC_SITE_URL`
- **Validation:** `lib/env.ts` — production required keys at build/runtime

Setup: [ops/LOCAL_ENV.md](./ops/LOCAL_ENV.md)

---

## Deployment

| Item | Detail |
|------|--------|
| Host | Vercel project `visual-era` (team: motivmias-projects) |
| Branch | `main` → production |
| CI | GitHub Actions — required on PRs |
| Domains | visual-era.com, visual-era.vercel.app |

---

## Boundaries (vera-website agent)

**Allowed:** `app/**` except `app/dashboard/**`, onboarding `components/**`, `lib/didit.ts`, onboarding `app/api/**`

**Restricted unless explicitly requested:** `middleware.ts`, Clerk webhooks, Supabase migrations, global deploy config

Full list: [agents/prompts/vera-website.md](./agents/prompts/vera-website.md) · [DECISIONS.md](./DECISIONS.md)
