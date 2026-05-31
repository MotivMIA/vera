# Launch roadmap — Visual Era onboarding

Living roadmap for the **onboarding website** only. Update this file when phases complete or priorities change.

**Last reviewed:** 2026-05-28

---

## Phase 0 — Human gates (complete)

Blocking ops before product build:

- GitHub repo on **natew-dev/vera**, Vercel connected, domain **visual-era.com**
- Clerk / Supabase / Didit accounts wired
- `./scripts/ops/run-phase2-verify.sh` passing (skips OK where documented)
- Branch protection + CI on `main`

Tracker: [ops/OPEN_OPS_ISSUES.md](./ops/OPEN_OPS_ISSUES.md) · [ops/POST_MIGRATION_CONNECTIONS.md](./ops/POST_MIGRATION_CONNECTIONS.md)

---

## Phase 1 — Foundation (complete)

Shipped on `main` (representative):

- Clerk webhook route + tests
- API / redirect test coverage
- Supabase baseline in repo
- Repo slug and docs aligned to **natew-dev/vera**

---

## Phase 2 — Product build (current)

**Goal:** Ship onboarding UX and reliability — consent → DIDIT → documents → success.

| Priority | Workstream | Notes |
|----------|------------|--------|
| P0 | Consent UX validation | `components/onboarding/consent-form.tsx` — ongoing polish |
| P0 | Onboarding redirects / guards | `lib/onboarding/guards.ts`, `resolveNextOnboardingPath`, sign-in/up server redirects |
| P0 | Production Clerk on custom domain | `lib/clerk/origins.ts`, homepage `AuthCard` + `ClerkLoaded` |
| P1 | DIDIT flow hardening | Session start, webhook, status polling |
| P1 | Document signing flow | PDF generation, Supabase storage |
| P1 | Success handoff | Minimal; no dashboard build |
| P2 | E2E smoke / production checks | `npm run dev:smoke`, Clerk proxy smoke |

**Agent:** **vera-website** only · Branch prefix: `agent-cursor-web-*`

**Ship:** `./scripts/agent-quick-check.sh` → `./scripts/agent-finish.sh` when unit is ready.

---

## Phase 3 — Launch polish (next)

- Production smoke on https://visual-era.com
- Clerk + Didit webhook URLs confirmed for prod
- Env parity: Vercel Production `NEXT_PUBLIC_SITE_URL=https://visual-era.com`
- No `ALLOW_DEV_AUTH_BYPASS` on Production
- Optional: human approval on PRs

---

## Phase 4 — Product app (deferred)

**Not started.** Create **vera-product** agent and `app/dashboard/**` only when onboarding is done.

| Milestone | Description |
|-----------|-------------|
| Dashboard shell | Auth-gated app layout |
| Core workflows | Per product spec (TBD) |
| Billing / settings | Later |

---

## What we are not doing in this roadmap

- Multi-domain agent roster (deprecated — see [DECISIONS.md](./DECISIONS.md))
- SDK auto-dispatch of Cursor chats
- ai-ops content in this repo
