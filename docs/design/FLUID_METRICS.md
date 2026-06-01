# Fluid responsive metrics

**Status:** Implemented (2026-06-01). CSS-only viewport interpolation for marketing/auth shells.

**Related:** [COLOR_TOKENS.md](./COLOR_TOKENS.md) (color layering) · `lib/brand/fluid-metrics.css` · `app/globals.css` `@theme` · `lib/brand/theme-classes.ts`

---

## Mental model (Webflow-inspired)

| Layer | Visual Era |
|-------|------------|
| Primitives | Viewport bounds `--fluid-vw-min` / `--fluid-vw-max` (20rem → 90rem) |
| Semantics | Fluid `--font-size-*`, `--space-*`, layout widths |
| Components | Tailwind utilities (`text-fluid-h1`, `py-section`) or `theme-classes.ts` strings |

Components reference **semantic fluid tokens**, not raw `text-4xl` + breakpoint ladders for every size.

---

## Viewport formula

All fluid sizes use the same linear interpolation between min and max across the viewport range:

```text
clamp(
  MIN,
  calc(MIN + (MAX - MIN) * ((100vw - var(--fluid-vw-min)) / var(--fluid-vw-range))),
  MAX
)
```

| Constant | Value | Notes |
|----------|-------|--------|
| `--fluid-vw-min` | `20rem` | 320px at 16px root |
| `--fluid-vw-max` | `90rem` | 1440px at 16px root |
| `--fluid-vw-range` | `max − min` | Used as divisor |

**Why rem for bounds:** respects user font-size settings; `100vw` still drives growth between anchors.

**No JS:** no resize listeners; scales continuously between anchors (not only at `sm`/`lg`).

---

## Token table

### Typography

| Token | Min | Max | Tailwind utility |
|-------|-----|-----|------------------|
| `--font-size-display` | 2.25rem | 4.5rem | `text-fluid-display` |
| `--font-size-h1` | 1.875rem | 4.5rem | `text-fluid-h1` |
| `--font-size-h2` | 1.125rem | 1.5rem | `text-fluid-h2` |
| `--font-size-body` | 1rem | 1.25rem | `text-fluid-body` |
| `--font-size-small` | 0.875rem | 1rem | `text-fluid-small` |
| `--font-size-caption` | 0.75rem | 0.8125rem | `text-fluid-caption` |
| `--line-height-h1` | 1.15 | 1.02 | `leading-fluid-h1` |
| `--line-height-body` | 1.625 | 1.75 | `leading-fluid-body` |
| `--font-size-motto` | 1.5rem | 2.875rem | `text-fluid-motto` (via `.brand-motto`) |
| `--font-size-motto-compact` | 1.375rem | 2rem | `text-fluid-motto-compact` (768px cap range) |
| `--font-size-lockup-wordmark` | 2.27rem | 3.65rem | hero lockup wordmark |
| `--font-size-lockup-wordmark-compact` | 2.27rem | 2.89rem | auth/mobile lockup (`size="xl"`) |
| `--font-size-wordmark-sm` | 1.25rem | 1.37rem | footer / chrome |
| `--font-size-wordmark-md` | 1.65rem | 1.83rem | marketing subpages |
| `--size-lockup-mark` | `wordmark × 1.349` | — | hero mark (derived) |
| `--size-lockup-mark-compact` | derived | — | compact lockup mark |
| `--size-lockup-mark-sm` / `--md` | see `fluid-metrics.css` | — | sm/md lockups |
| `--space-lockup-gap` | 0.78rem | 1.1rem | hero lockup gap |
| `--lockup-offset` | 3px | 6px | wordmark baseline nudge |

### Spacing

| Token | Min | Max | Tailwind utility |
|-------|-----|-----|------------------|
| `--space-section-y` | 2rem | 2.5rem | `py-section`, `px-section`, … |
| `--space-section-y-lg` | 3rem | 3.5rem | `py-section-lg` |
| `--space-block` | 1.25rem | 2rem | `space-y-fluid-block`, `gap-fluid-block` |
| `--space-inline` | 1.25rem | 2rem | `px-fluid-inline` |
| `--space-gap-lg` | 2rem | 2.5rem | `gap-fluid-gap-lg` |
| `--space-gap-md` | 1.5rem | 2rem | `gap-fluid-gap-md` |
| `--space-gap-sm` | 0.75rem | 1rem | `gap-fluid-gap-sm` |
| `--space-card-y` | 1.25rem | 1.5rem | `py-fluid-card-y` |

### Layout

| Token | Value | Tailwind utility |
|-------|-------|------------------|
| `--content-max-width` | 80rem | `max-w-content` |
| `--auth-card-max-width` | 28rem | `max-w-auth-card` |
| `--hero-gap` | `var(--space-gap-lg)` | via `gap-fluid-gap-lg` |
| `--hero-min-height-offset` | 10rem → 12rem | used in `heroGridClass` min-height calc |

---

## Tailwind bridge

Defined in `app/globals.css` `@theme inline` — maps CSS vars to `--text-fluid-*`, `--spacing-*`, `--max-width-*`.

Shared class strings: `lib/brand/theme-classes.ts` (`fluidH1Class`, `heroGridClass`, `contentShellClass`, …).

---

## Migrated surfaces (this pass)

- Homepage hero grid + branding headline/body + logo lockup (mark/wordmark)
- Auth card shell, tabs, notices
- Site auth forms (headings, captions, SSO buttons)
- Site footer padding, gaps, type
- Sign-in / sign-up standalone views
- `body` base font size + `h1`/`h2` element defaults in `globals.css`

---

## Follow-up (still fixed Tailwind)

- **Onboarding / app chrome** — dashboard cards, step headers
- **Legal pages** — prose `text-sm` / `max-w-*` ladders
- **UI primitives** — `Button` `size="sm"`, `Badge`, `Input` heights (`h-11`)
- **BrandLogo mark-only** — discrete `size` prop when `showWordmark={false}`; lockups use fluid CSS vars
- **Grid breakpoints** — `lg:grid-cols-[1.05fr_.95fr]` remains breakpoint-based (layout structure, not metrics)
- **Footer column widths** — `sm:w-56`, `lg:w-80` (component layout, not rhythm)
- **Framer / Clerk embed** — third-party or isolated CSS

---

## Visual risks

| Risk | Mitigation |
|------|------------|
| Hero H1 smaller than old `lg:text-7xl` between ~1024–1280px | Fluid curve is smooth; spot-check 768–1200px |
| Body text scales site-wide via `body { font-size }` | Intentional; app areas inherit until migrated |
| Very narrow (&lt;320px) | `clamp` min values floor sizes |
| Very wide (&gt;1440px) | `clamp` max values cap sizes |
| Auth card title used `text-2xl` (1.5rem) | `text-fluid-h2` max is 1.5rem — aligned |
