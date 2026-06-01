# Launch roadmap — Visual Era onboarding

Living roadmap for the **onboarding website** only. Update this file when phases complete or priorities change.

**Last reviewed:** 2026-06-01

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

**Goal:** Ship onboarding UX and reliability — consent → DIDIT → documents → success — plus a credible public marketing surface.

### 2a — Onboarding (core)

| Priority | Workstream | Notes |
|----------|------------|--------|
| P0 | Consent UX validation | `components/onboarding/consent-form.tsx` — ongoing polish |
| P0 | Onboarding redirects / guards | `lib/onboarding/guards.ts`, `resolveNextOnboardingPath`, sign-in/up server redirects |
| P0 | Production Clerk on custom domain | `lib/clerk/origins.ts`, `AuthCard` + `ClerkLoaded` on `/login` and sign-in/up |
| P1 | DIDIT flow hardening | Session start, webhook, status polling |
| P1 | Document signing flow | PDF generation, Supabase storage |
| P1 | Success handoff | Minimal; no dashboard build |
| P2 | E2E smoke / production checks | `npm run dev:smoke`, Clerk proxy smoke |

### 2b — Marketing & design system

| Priority | Workstream | Status (2026-06-01) |
|----------|------------|------------------------|
| P0 | Semantic tokens + fluid metrics | **Merged** — PR [#89](https://github.com/natew-dev/vera/pull/89) (`agent-cursor-semantic-design-tokens`): `lib/brand/tokens.css`, `fluid-metrics.css`, auth/marketing shell migration |
| P0 | Unified auth shell | **Merged** — `AppAuthShell` on `/login`, `/sign-in`, `/sign-up`; `HomeHero` retired from `/` |
| P1 | CRM informative landing at `/` | **In progress** — `CrmLandingPage` + `components/marketing/landing/*` on branch `agent-cursor-semantic-design-tokens` (uncommitted WIP); **production `main` still serves `OfmMarketingPage`** |
| P1 | Marketing assets | **In progress** — `public/marketing/*` (hero, auth ambient); CSS value art in `components/marketing/marketing-*.tsx` |
| P1 | Multi-palette `data-theme` | **In progress** — `styles/tokens/colors.css`, `lib/brand/themes/*.css`, dev `ThemeSwitcher` (default prod palette: `noir-magenta`) |
| P2 | Footer unification | **In progress** — `LandingFooter` + `SiteFooter` share columns via `marketing-footer-columns.ts` |
| P2 | Real testimonials / copy audit | Placeholder carousel on CRM landing — replace before launch polish |
| P3 | Palette decision for production | Pick default `data-theme`; hide or remove dev switcher before Phase 3 |

**Agent:** **vera-website** only · Branch prefix: `agent-cursor-*` (CI-enforced; see [CI_CD.md](./CI_CD.md))

**Ship:** `./scripts/agent-quick-check.sh` → `./scripts/agent-finish.sh` when unit is ready.

**Active branch:** `agent-cursor-semantic-design-tokens` — finish CRM landing + palette work, then PR to `main`.

---

## Phase 3 — Launch polish (next)

- Merge CRM landing + theme palette PR; verify `/` vs `/login` vs `/sign-in` on preview and production
- Production smoke on https://visual-era.com
- Clerk + Didit webhook URLs confirmed for prod
- Env parity: Vercel Production `NEXT_PUBLIC_SITE_URL=https://visual-era.com`
- No `ALLOW_DEV_AUTH_BYPASS` on Production
- Replace placeholder testimonials; final i18n pass on `CrmLanding` namespace
- Optional: human approval on PRs

---

## Phase 4 — Product app (deferred)

**Not started.** Create **vera-product** agent and `app/(dashboard)/**` only when onboarding is done.

| Milestone | Description |
|-----------|-------------|
| Dashboard shell | Auth-gated `(dashboard)/layout.tsx` — **scaffold exists** (`/creator` placeholder) |
| Core workflows | Per product spec (TBD) |
| Billing / settings | Later |

### Phase 4b — Site Admin UI (planned, deferred)

**Goal:** Authenticated operators manage public site config without repo edits for every copy change.

**Spec:** [ADMIN_UI.md](./ADMIN_UI.md) · Scaffold: `/admin` (coming soon page)

| Priority | Workstream | Notes |
|----------|------------|--------|
| P0 | Admin auth gate | Clerk session + allowlist or `site_admin` role; fail closed |
| P1 | Footer & nav config | `lib/marketing/footer-config.ts`, column registry |
| P1 | Default `data-theme` | Production palette without dev `ThemeSwitcher` |
| P1 | Locales | Enable/disable `en` / `es` / `it`; missing-key visibility |
| P2 | i18n namespaces | `CrmLanding`, marketing, legal strings (file-based v1) |
| P2 | Legal slug registry | Align with `app/legal/[slug]` and `lib/legal/documents.ts` |
| P3 | Marketing flags | CRM vs OFM landing, testimonial sources |

**Host:** Same origin as app today (`/admin`); optional later cutover to `app.visual-era.com` — see [DECISIONS.md](./DECISIONS.md).

**Not in 4b v1:** Full CMS, media library, creator/chatter tools, DIDIT admin.

---

## What we are not doing in this roadmap

- Multi-domain agent roster (deprecated — see [DECISIONS.md](./DECISIONS.md))
- SDK auto-dispatch of Cursor chats
- ai-ops content in this repo
