# Visual Era — modular architecture audit

**Status:** Proposal only — no route or auth refactor in this doc.  
**Product:** Public OFM agency site powered by VERA (creator onboarding today; dashboards later).

---

## 1. Current structure assessment

### What exists today

| Area | Routes | Code | Maturity |
|------|--------|------|----------|
| **Marketing** | `/`, `/legal/*` | `components/marketing/*`, `app/page.tsx` | Good UI shell; brand tokens now centralized |
| **Auth** | `/sign-in`, `/sign-up` | `components/auth/*`, `components/marketing/auth-card.tsx`, `lib/clerk/*` | Clerk embedded in marketing card; proxy + origins hardened |
| **Onboarding** | `/onboarding`, `/onboarding/consent` | `lib/onboarding/*`, `components/onboarding/consent-form.tsx` | Guards, status, audit trail in place |
| **Verification** | `/verify-identity` | `lib/didit.ts`, `components/onboarding/didit-embed.tsx`, `app/api/didit/*` | Embedded DIDIT; webhooks + consent gate |
| **Contracts / PDF** | `/documents`, `/success` | `lib/onboarding/pdf.ts`, `components/onboarding/internal-signing-packet.tsx`, `app/api/documents/*` | In-app signing; PDF logic lives under `onboarding/` |
| **Dashboard** | — | — | Not started |

### Strengths

- Clear **onboarding critical path** with server guards (`lib/onboarding/guards.ts`, `status.ts`).
- **Platform libs** already split: `lib/clerk`, `lib/didit`, `lib/supabase`, `lib/onboarding`.
- **UI primitives** (`components/ui/*`) separate from feature components.
- **Brand module** started: `lib/brand/colors.ts`, `components/brand/brand-logo.tsx`, CSS tokens in `app/globals.css`.
- **Design tokens:** role-based semantic layer in `lib/brand/tokens.css` — see [design/COLOR_TOKENS.md](./design/COLOR_TOKENS.md).

### Gaps vs target modular model

- **App Router folders** are flat — marketing, auth, onboarding, verification, and contracts share `app/` without route groups; harder to see module boundaries at a glance.
- **Contracts + PDF** are nested under `lib/onboarding/` instead of a dedicated contracts/pdf module (growing pain as dashboards arrive).
- **No `lib/email`** yet (Resend not wired in product code).
- **Cross-cutting paths** (`middleware.ts`, `lib/env.ts`, webhooks) are correct but must stay stable during any move.

### Verdict

The codebase is **already modular in `lib/` and `components/`**, but **not yet modular in `app/` layout**. ChatGPT’s route-group sketch is directionally right; a full rewrite is not. Prefer **organizational moves that preserve URLs**.

---

## 2. Recommended modular folder structure

### Target `app/` (route groups — URLs unchanged)

Next.js route groups `(name)` do **not** appear in URLs. This matches ChatGPT’s intent without breaking links or Clerk/DIDIT callbacks.

```text
app/
  layout.tsx                    # root ClerkProvider, globals
  globals.css

  (marketing)/
    page.tsx                    # /
    legal/
      page.tsx
      [slug]/page.tsx

  (auth)/
    sign-in/[[...sign-in]]/
    sign-up/[[...sign-up]]/

  (onboarding)/
    onboarding/
      page.tsx
      consent/page.tsx
    verify-identity/page.tsx    # DIDIT — keep path for bookmarks & docs
    documents/page.tsx
    success/page.tsx

  (dashboard)/                  # future — empty until product spec
    # creator/, admin/, chatter/ …

  api/                          # unchanged top-level; optional subfolders later
    didit/
    documents/
    onboarding/
    webhooks/
```

### Target `lib/` (extend, don’t replace)

```text
lib/
  brand/           # colors, tokens.css, theme-classes, gradients  ✅ started
  clerk/           # proxy, appearance, webhooks, sync       ✅ keep
  didit/           # split from lib/didit.ts when it grows     🔜 optional
  supabase/        # server client                           ✅ keep
  onboarding/      # guards, status, constants, audit        ✅ keep
  contracts/       # signing domain types, validation        🔜 extract from onboarding
  pdf/             # generation from lib/onboarding/pdf.ts   🔜 extract
  email/           # Resend templates / send helpers           🔜 when needed
  env.ts           # single env gate                         ✅ keep at lib root
  auth/session.ts  # session helpers                         ✅ keep
```

### Target `components/`

```text
components/
  brand/           # BrandLogo, future BrandMark               ✅ started
  ui/              # shadcn primitives                         ✅ keep
  marketing/       # home, footer, auth card                   ✅ keep
  auth/            # sign-in/up views                          ✅ keep
  onboarding/      # consent, didit, documents shell           ✅ keep
  contracts/       # internal-signing-packet (move later)      🔜
  dashboard/       # future                                    🔜
```

---

## 3. What should stay unchanged

Do **not** move or refactor these without explicit approval and a dedicated PR:

| Asset | Why |
|-------|-----|
| `middleware.ts` | Clerk proxy, protected routes, cookie handling, `authorizedParties` |
| `lib/env.ts` | Production validation; Vercel env contract |
| `lib/clerk/proxy-url.ts`, `hosted-only.ts`, `origins.ts` | Custom domain auth |
| `app/api/webhooks/clerk/route.ts` | User sync |
| `app/api/didit/webhook/route.ts` | Identity status |
| Supabase migrations / schema | No drive-by migration edits |
| Public URLs | `/onboarding/consent`, `/verify-identity`, `/documents`, `/sign-in`, `/sign-up` |
| `.env.example` keys and names | CI and deploy docs depend on them |

---

## 4. What should be refactored (when ready)

| Priority | Change | Benefit |
|----------|--------|---------|
| **P0 — done** | Brand tokens + `BrandLogo` + `public/brand/logo.png` | One place to match logo colors |
| **P1** | Route groups in `app/` (move files only) | Clear module boundaries, zero URL change |
| **P2** | Extract `lib/contracts/` + `lib/pdf/` from `lib/onboarding/pdf.ts` and signing components | Onboarding lib stops being a junk drawer |
| **P3** | `components/contracts/internal-signing-packet.tsx` | Aligns UI with contracts module |
| **P4** | `lib/didit/` folder (client, types, webhook helpers) | Easier DIDIT upgrades |
| **P5** | `(dashboard)/` scaffold + `lib/dashboard/` | Future creator/admin/chatter surfaces |
| **P6** | `lib/email/` when transactional email ships | Isolated from onboarding |

**Not recommended now:** merging marketing + onboarding layouts, replacing Clerk components with custom auth again, or splitting `api/` across repos.

---

## 5. Safest phased migration plan

### Phase 0 — Brand module ✅ (this pass)

- [x] `public/brand/logo.png`
- [x] `lib/brand/colors.ts` sampled from logo
- [x] CSS variables in `app/globals.css`
- [x] `components/brand/brand-logo.tsx` on marketing, auth, onboarding, footer

### Phase 1 — Documentation ✅

- [x] `docs/MODULAR_ARCHITECTURE.md`, `CODEBASE_MAP.md`, `INDEX.md`
- Path aliases deferred (optional; `@/*` remains canonical)

### Phase 2 — Route groups ✅

- [x] `(marketing)` — `/`, `/legal/*`
- [x] `(auth)` — `/sign-in`, `/sign-up`
- [x] `(onboarding)` — `/onboarding/*`, `/verify-identity`, `/documents`, `/success`
- URLs unchanged

### Phase 3 — Lib extraction ✅

- [x] `lib/pdf/` ← `build-signed-document.ts`; shim at `lib/onboarding/pdf.ts`
- [x] `lib/contracts/` — manager identity + document types
- [x] `components/contracts/internal-signing-packet.tsx`; shim in `components/onboarding/`

### Phase 4 — Dashboard placeholder ✅

- [x] `(dashboard)/layout.tsx` — Clerk auth gate
- [x] `(dashboard)/creator/page.tsx` — coming soon
- [x] Middleware protects `/creator`, `/admin`, `/chatter`

Each phase: one writer branch, CI green, no middleware/env edits bundled in.

### Phase 5 — Boundaries + layouts + env profiles ✅

- [x] `lib/routes.ts` — shared path constants (marketing/auth avoid `lib/onboarding/*`)
- [x] ESLint `no-restricted-imports` for marketing, onboarding, clerk modules
- [x] `(marketing)/layout.tsx` — shared footer (pages no longer embed `SiteFooter`)
- [x] `(onboarding)/layout.tsx` — shared page glow shell
- [x] `(auth)/layout.tsx` — thin auth shell
- [x] `components/marketing/index.ts` — public module surface
- [x] `.env.local` / `.env.production.local` (Next.js native) — templates, `npm run env:split`, `env:migrate`

---

## 6. Risks (Clerk, DIDIT, Supabase, middleware, env)

| Risk | Trigger | Mitigation |
|------|---------|------------|
| **Clerk proxy break** | Touching `middleware.ts` or moving auth routes without updating `signInUrl` / `allowedRedirectOrigins` | Keep `lib/clerk/origins.ts` canonical; smoke `production-clerk-proxy-smoke.sh` after any auth change |
| **OAuth redirect mismatch** | Renaming `/sign-in` or dropping SSO callback paths | Preserve paths; grep for `sign-in`, `sign-up`, `ONBOARDING_ENTRY_PATH` before merge |
| **DIDIT webhook URL** | Changing API route paths | DIDIT dashboard URLs must match; keep `app/api/didit/webhook` path |
| **Consent gate bypass** | Moving pages outside guarded matchers | `middleware.ts` protected list must still cover `/onboarding`, `/verify-identity`, `/documents`, APIs |
| **Supabase service role leak** | Splitting lib without care | Keep `lib/supabase/server.ts` server-only; never import in client components |
| **Env drift** | New modules reading env ad hoc | All new config through `lib/env.ts` only |
| **PDF / signing regression** | Extracting pdf module | Vitest + manual `/documents` submit on preview |
| **Route group merge conflicts** | Large file moves | One module per PR; use `git mv` |

---

## ChatGPT proposal vs this plan

| ChatGPT | This doc |
|---------|----------|
| `(verification)` route group | Fold into `(onboarding)` — same funnel, fewer layouts; keep `/verify-identity` URL |
| `(contracts)` route group | Fold into `(onboarding)` until contracts become a standalone product surface |
| Immediate `/lib` tree | **Agree** — extend incrementally, extract pdf/contracts first |
| “Do not rewrite yet” | **Agree** — Phase 0 brand done; Phase 2+ are deliberate PRs |

---

## Quick reference — module ownership

| Module | Agent (see `docs/agents/ROSTER.md`) | Owns |
|--------|--------------------------------------|------|
| Marketing + brand | vera-website | `(marketing)`, `components/marketing`, `lib/brand` |
| Auth | vera-clerk | `(auth)`, `lib/clerk`, auth card |
| Onboarding | vera-onboarding | consent, status, guards |
| Verification | vera-identity | DIDIT embed + API |
| Contracts | vera-onboarding (+ future vera-contracts) | documents, pdf, signing UI |
| Dashboard | TBD | `(dashboard)` when spec exists |

See also: [CODEBASE_MAP.md](./CODEBASE_MAP.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
