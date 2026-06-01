# Site Admin UI — specification

**Status:** Planned (not in Phase 2 scope). Thin scaffold at `/admin` only.  
**Last updated:** 2026-06-01

---

## Goals

Give Visual Era operators a **authenticated, non-public** surface to manage marketing and site configuration without editing the repo for every copy or footer change.

| Goal | Why |
|------|-----|
| Content & locales | Keep `en` / `es` / `it` (and future locales) in sync without deploy-only hotfixes |
| Marketing config | Footer columns, nav links, default theme, hero/feature flags |
| Legal | Publish or sync legal slugs referenced from marketing and onboarding |
| Safe defaults | No admin routes on public marketing paths; no CMS until auth and audit are defined |

**Not a goal (v1):** Full creator operations, billing, DIDIT review, or replacing Clerk/Supabase architecture.

---

## Host & routes

| Phase | Host | Admin base path |
|-------|------|-----------------|
| **Now (scaffold)** | Same deploy as onboarding (`visual-era.com` today) | `/admin` |
| **Later (optional)** | Dedicated app origin (e.g. `app.visual-era.com`) | `/admin` on that host only |

Public marketing stays on apex (`visual-era.com` `/`, `/legal/*`, locale prefixes). Admin must **never** be exposed under `(marketing)` or locale-prefixed marketing groups.

**App routes (current repo):**

```text
app/(dashboard)/
  layout.tsx          # Clerk session required (existing)
  creator/page.tsx    # creator tools (deferred)
  admin/page.tsx      # site admin (scaffold → v1)
  chatter/page.tsx    # future role surface
```

Constants: `lib/dashboard/constants.ts` → `DASHBOARD_ROUTES.admin` = `/admin`.

Middleware already protects `/admin(.*)` alongside `/creator` and `/chatter` — do not add admin under `[locale]/(marketing)`.

---

## Authentication & authorization

| Layer | Approach |
|-------|----------|
| **Session** | Clerk (same as dashboard layout) — unauthenticated users redirect to sign-in |
| **Authorization (v1)** | **Allowlist** of Clerk `userId` (env e.g. `SITE_ADMIN_USER_IDS`) **or** Clerk **public metadata** / organization role `site_admin` |
| **Authorization (v2)** | Clerk Organizations + `org:admin` for Visual Era staff org |
| **API routes (future)** | `app/api/admin/*` — server-only; check same gate as pages; never callable from marketing client bundles |

**Principles:**

- Fail closed: non-admins see 403 or redirect to `/` (product decision at implementation).
- No separate admin Clerk application in v1 — reuse existing instance and proxy.
- Do not store admin secrets in client components; gate in layout or server components + API.

---

## Data model (phased)

| Concern | v1 recommendation | Later |
|---------|-------------------|--------|
| **i18n strings** | Continue file-based `messages/{locale}.json`; admin UI **exports/edits** via PR workflow or guarded API writing to git (optional) | Supabase `site_content` table + cache invalidation |
| **Footer / nav** | TypeScript config (`lib/marketing/footer-config.ts`) edited via admin form → persist to DB or JSON artifact | Versioned rows + preview |
| **Theme default** | `data-theme` default in layout/env; admin sets production default key | Per-environment overrides in Vercel env |
| **Legal** | Slugs in `lib/legal/documents.ts` + `app/legal/[slug]`; admin triggers content review, not WYSIWYG on day one | CMS-backed legal with audit trail |
| **Marketing page toggle** | Feature flags (env or Supabase `site_settings`) for CRM vs OFM landing | Full page builder — out of scope |

**Supabase (when used):** `site_settings`, `content_revisions` (TBD migrations); service role on server only; RLS denies anon/authenticated creators from admin tables.

---

## v1 feature priority (recommended)

Build in this order after onboarding Phase 3 ships:

| P | Feature | Notes |
|---|---------|--------|
| P0 | Admin gate + shell | Layout, role check, nav between admin sections |
| P0 | Read-only **site overview** | Active theme, locales, footer preview |
| P1 | **Footer & nav config** | Edit `marketing-footer-columns` / footer config safely |
| P1 | **Default theme** | Set production `data-theme` without dev switcher |
| P1 | **Locale list** | Enable/disable locales; link to missing keys report |
| P2 | **i18n key browser** | Search `CrmLanding`, `Marketing`, `Legal` namespaces; edit with validation |
| P2 | **Legal slug registry** | List slugs, last updated, link to preview `/legal/[slug]` |
| P3 | **Marketing flags** | e.g. CRM landing on/off, testimonial source |
| — | Full CMS, media library, A/B tests | Out of scope v1 |

---

## Out of scope (explicit)

- Creator performance dashboard (`/creator`)
- Chatter/moderation tools (`/chatter`)
- DIDIT case review, document PDF regeneration from admin
- Public routes that expose admin UI without auth
- Middleware matcher changes without dedicated PR + proxy smoke
- New Clerk apps, webhook shape changes, or `lib/env.ts` drive-by edits

---

## Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **0 (done)** | Docs + `/admin` placeholder + `DASHBOARD_ROUTES.admin` |
| **1** | `requireSiteAdmin()` helper + env allowlist; 403 page |
| **2** | Read-only dashboards (theme, locales, footer preview) |
| **3** | Footer/nav + theme default writes (API + audit log) |
| **4** | i18n + legal registry tools |
| **5** | Optional `app.visual-era.com` cutover (DNS/Vercel + `authorizedParties`) |

**Agent:** Start with **vera-website** for shell and marketing config; involve **vera-product** when Supabase admin tables and APIs land.

---

## Verification checklist (when implementing)

- [ ] Signed-out user cannot access `/admin` (redirect to sign-in)
- [ ] Signed-in non-admin cannot mutate settings
- [ ] Admin UI not linked from public marketing header/footer
- [ ] `npm run typecheck` + `npm run lint` + targeted tests for auth helper
- [ ] After any middleware change: `production-clerk-proxy-smoke.sh`

---

## Related docs

- [LAUNCH_ROADMAP.md](./LAUNCH_ROADMAP.md) — Phase 4b Site Admin UI
- [STRATEGIC_PLAN.md](./STRATEGIC_PLAN.md) — platform scope
- [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) — `components/admin/`, `(dashboard)/admin`
- [DECISIONS.md](./DECISIONS.md) — host and auth ADR
- [design/I18N.md](./design/I18N.md) — locale routing
