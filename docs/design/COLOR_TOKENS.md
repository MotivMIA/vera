# Color tokens — Webflow inspiration vs Visual Era

**Status:** Semantic token layer **implemented** on `main` (2026-06-01, PR #89). Multi-palette `data-theme` system **in progress** on `agent-cursor-semantic-design-tokens` (`styles/tokens/colors.css`, `lib/brand/themes/*.css`).

**Sources (Webflow):**

- [Variables — Help Center](https://help.webflow.com/hc/en-us/articles/33961268146323-Variables)
- [Variables — The Webflow Way](https://webflow.com/webflow-way/design-systems/variables) (primitives, semantics, modes, collections)
- [Intro to Variables — Webflow University](https://university.webflow.com/videos/intro-to-variables)
- [Variables — Designer API](https://developers.webflow.com/designer/reference/variables-detail-overview)

**Sources (Visual Era):**

- `lib/brand/tokens.css` — brand primitives (CSS source of truth)
- `lib/brand/colors.ts` — same hex values for JS (Clerk, inline styles)
- `app/globals.css` — semantic UI tokens + Tailwind `@theme inline`
- [FLUID_METRICS.md](./FLUID_METRICS.md) — viewport-fluid type, spacing, layout (`lib/brand/fluid-metrics.css`)

---

## 1. Webflow’s model (short)

Webflow **variables** are reusable design tokens. Updating a variable updates every style property that references it. Legacy **swatches** are now color variables in the Variables panel.

| Concept | What it does |
|--------|----------------|
| **Variable types** | Color, size, percentage, number, font family |
| **Apply to properties** | In the Style panel, link a property (background, border, text, gradient stop, spacing, etc.) to a variable via the purple “link” control — not a hard-coded value |
| **CSS output** | Variables compile to **CSS custom properties** (`var(--…)`). “Copy CSS” from the panel for custom code |
| **Collections** | Sidebar buckets: e.g. Color, Typography, Layout, Theme, Responsive, Components — site-scoped or Shared Library |
| **Groups** | `GroupName/Variable Name` (e.g. `Palette/Magenta 500`) for panel organization |
| **Primitives** | Raw appearance names (`Blue 400`, `Magenta 500`) — no usage context |
| **Semantics** | Usage names (`Card Border`, `Primary Text`) — often **alias** primitives |
| **Aliases** | One variable references another (same type); chain updates propagate |
| **Modes** | Multiple value columns per variable: **responsive** (per breakpoint) or **manual themes** (light/dark, sub-brand) applied to a selector |
| **Functions** | `calc()`, `clamp()`, `color-mix()`, `min()`/`max()` on custom variable values |

**Modulation pattern:** *property → variable reference → (optional alias) → primitive value → (optional mode overrides context)*. The “attribute” in the UI is the style field; the “modulation” is picking a variable (or mode) instead of typing a hex.

---

## 2. Visual Era today

### Layer stack

```text
┌─────────────────────────────────────────────────────────────┐
│  Components: Tailwind (text-accent, border-accent/25)       │
│              or var(--brand-magenta-bright)                 │
├─────────────────────────────────────────────────────────────┤
│  Tailwind @theme inline  →  --color-accent, --color-primary │
├─────────────────────────────────────────────────────────────┤
│  :root semantics (shadcn)  →  --accent, --primary, --ring    │
│       often: var(--brand-magenta)                           │
├─────────────────────────────────────────────────────────────┤
│  Brand primitives  →  --brand-magenta, --brand-gradient, …  │
│       (lib/brand/tokens.css)                                │
├─────────────────────────────────────────────────────────────┤
│  JS mirror  →  brand.magenta (lib/brand/colors.ts)          │
└─────────────────────────────────────────────────────────────┘
```

### Primitive palette (brand)

| Token | Role |
|-------|------|
| `--brand-magenta` | Core brand pink |
| `--brand-magenta-bright` | Hover / emphasis |
| `--brand-magenta-mid` | Mid ramp |
| `--brand-magenta-deep` | Deep ramp |
| `--brand-purple-deep` | Gradient end |
| `--brand-gradient` | Logo / gradient text |
| `--brand-glow`, `--brand-glow-purple` | Page atmosphere |
| `--brand-selection` | Text selection |

### Semantic UI (app chrome)

| Token | Current value | Notes |
|-------|---------------|--------|
| `--primary` | `var(--brand-magenta)` | Buttons (`bg-primary`) |
| `--accent` | `var(--brand-magenta)` | Links, badges, highlights — **same as primary** |
| `--ring` | `var(--brand-magenta)` | Focus rings |
| `--border` | `rgba(255,255,255,0.1)` | Global `border-color` via `*` |
| `--background`, `--foreground`, `--muted`, … | Fixed dark-theme neutrals | Not brand-modulated |

### How components consume color

| Pattern | Example | Webflow analogue |
|---------|---------|------------------|
| Semantic Tailwind | `text-accent`, `bg-accent/10`, `border-accent/25` | Semantic variable on text/background/border |
| Semantic + primitive hover | `hover:text-[var(--brand-magenta-bright)]` | Direct primitive override on one state |
| Primitive in UI kit | `hover:bg-[var(--brand-magenta-bright)]` on `Button` | Primitive on hover modifier |
| Hard-coded rgba/hex | `glass-panel`, `body` radial gradients, Clerk `#f6f4ef` | **Not** token-linked — one-off values |
| JS constants | `brand.magenta` in `lib/clerk/appearance.ts` | Parallel source — must stay in sync with CSS |

There is a `dark` custom variant in `globals.css`. **Theme palettes** use `[data-theme]` (see §9); this is not the same as a single global light/dark toggle.

---

## 3. Side-by-side mapping

| Webflow | Visual Era today | Gap / note |
|---------|------------------|------------|
| **Collection: Color** | `lib/brand/tokens.css` | Primitives only; no separate “Theme” collection file |
| **Collection: Theme / modes** | `data-theme` palettes (branch WIP) | `noir-magenta` default on prod; dev switcher only |
| **Group: Palette/Magenta 500** | `--brand-magenta` (name describes hue, not step) | No numeric ramp (100–900) |
| **Semantic: Primary Text** | `--foreground` | Good |
| **Semantic: Card Border** | `--border` (global) | No `border-accent` semantic; accents use `border-accent/25` (Tailwind → `--accent`) |
| **Alias: Body Copy → Main Color** | `--accent` → `--brand-magenta` | Same pattern; primary duplicates accent |
| **Apply variable to border** | `border-border` rare; often `border-white/10` | Many borders bypass `--border` |
| **Variable modes (dark theme)** | `[data-theme="…"]` in `lib/brand/themes/*.css` | Ship default palette; remove dev switcher before launch polish |
| **Copy CSS / custom code** | `var(--brand-*)` in arbitrary Tailwind | Same idea |
| **Shared Library** | Monorepo `lib/brand/*` | One repo source of truth ✓ |
| **Swatches → color variables** | Already on CSS variables | ✓ |

---

## 4. Recommended inspiration (incremental)

Adopt Webflow’s **primitive → semantic → property** chain without a Designer panel. Keep `tokens.css` as the primitive collection; grow semantics in `:root` (or a future `lib/brand/semantics.css`).

### 4.1 Primitives — name like a ramp (optional)

Keep existing vars for compatibility; document logical steps:

| Suggested primitive | Current var |
|--------------------|-------------|
| `magenta-500` (base) | `--brand-magenta` |
| `magenta-400` (bright) | `--brand-magenta-bright` |
| `magenta-600` (mid) | `--brand-magenta-mid` |
| `magenta-800` (deep) | `--brand-magenta-deep` |
| `purple-900` (deep) | `--brand-purple-deep` |

Add **aliases** only when touching CSS (no rename required):

```css
/* optional aliases in tokens.css — additive */
:root {
  --palette-magenta-500: var(--brand-magenta);
  --palette-magenta-400: var(--brand-magenta-bright);
  /* … */
}
```

### 4.2 Semantics — role-based tokens (Webflow “semantics”)

Prefer **usage names** at the `:root` layer, referencing primitives:

| Semantic token | Suggested maps to | Use for |
|----------------|-------------------|---------|
| `--color-border-default` | `--border` | Panels, dividers |
| `--color-border-accent` | `color-mix(in srgb, var(--brand-magenta) 25%, transparent)` or existing `accent/25` | Marketing cards, auth callouts |
| `--color-text-link` | `--accent` | Inline links |
| `--color-text-link-hover` | `--brand-magenta-bright` | Footer, auth links |
| `--color-surface-glass` | extract from `.glass-panel` | One glass recipe |
| `--color-focus-ring` | `--ring` | Focus states |

Wire into Tailwind when useful:

```css
@theme inline {
  --color-border-accent: var(--color-border-accent);
}
```

Then prefer `border-border-accent` over `border-accent/25` for consistency (optional migration).

### 4.3 Modulation without Webflow UI

| Mechanism | Use |
|-----------|-----|
| **CSS custom properties** | Already the Webflow export format |
| **Aliases** | `--primary: var(--brand-magenta)` — extend for borders/text |
| **`color-mix()`** | Tinted borders/backgrounds from one primitive (Webflow supports this in variables) |
| **Modes (later)** | `[data-theme="light"]` or `.dark` blocks overriding semantic tokens only |
| **`@theme inline`** | Tailwind v4 bridge — same as linking Style panel fields to variables |

### 4.4 Single source of truth

| Concern | Rule |
|---------|------|
| Hex values | Edit `lib/brand/tokens.css` first |
| JS | Regenerate or manually sync `lib/brand/colors.ts` |
| Clerk | Prefer CSS variables in appearance if Clerk API allows; until then keep `brand.*` |
| New UI | Prefer semantic Tailwind (`text-accent`) or semantic vars; use primitives only for hover/gradient exceptions |

### 4.5 What not to copy yet

- Full Webflow **collection** sprawl (6+ panels) — one product theme is enough for now.
- **Per-breakpoint variable modes** — use responsive Tailwind unless type/spacing tokens multiply.
- Renaming all `--brand-*` to `--palette-*` in one PR — high churn, low gain.

---

## 5. Optional small refactor (additive only)

**Scope:** Document-first; implement only when convenient (one file, no component churn).

Add to `lib/brand/tokens.css`:

```css
:root {
  /* Semantic aliases (Webflow-style role tokens) */
  --color-border-default: rgba(255, 255, 255, 0.1);
  --color-border-accent: color-mix(in srgb, var(--brand-magenta) 25%, transparent);
  --color-text-link: var(--brand-magenta);
  --color-text-link-hover: var(--brand-magenta-bright);
}
```

Optionally point `app/globals.css` `--border` at `--color-border-default` so glass panels and globals share one knob.

**Do not** change `--accent` / `--primary` behavior in the same pass unless auditing all `accent` usages.

---

## 6. File reference

| File | Responsibility |
|------|----------------|
| `lib/brand/tokens.css` | Brand primitives + derived (gradient, glow) |
| `lib/brand/colors.ts` | TS export for non-CSS consumers |
| `app/globals.css` | App semantics, `@theme`, utilities (`.brand-gradient-text`, `.glass-panel`) |
| `lib/clerk/appearance.ts` | Clerk theme — uses `brand` object |
| `components/ui/button.tsx` | `primary` + `accent` variants; hover uses primitive var |

---

## 7. Implemented (2026-06-01)

### New semantic CSS variables (`lib/brand/tokens.css`)

| Token | Maps to / role |
|-------|----------------|
| `--color-border-default` | `rgba(255,255,255,0.1)` — panels, footer dividers; aliases `--border` in `globals.css` |
| `--color-border-accent` | `color-mix` 25% magenta — auth callouts |
| `--color-border-accent-strong` | `color-mix` 30% magenta — badges, hero pill |
| `--color-border-accent-hover` | `color-mix` 50% magenta — interactive borders |
| `--color-surface-panel` | `rgba(255,255,255,0.04)` — auth panels, shells |
| `--color-surface-panel-hover` | `rgba(255,255,255,0.06)` — badge hover |
| `--color-surface-panel-emphasis` | `rgba(255,255,255,0.08)` — SSO button hover |
| `--color-surface-accent-muted` | `color-mix` 10% magenta — accent tint backgrounds |
| `--color-surface-tab-rail` | `rgba(0,0,0,0.2)` — auth tab switcher |
| `--color-text-link` | `var(--brand-magenta)` |
| `--color-text-link-hover` | `var(--brand-magenta-bright)` |
| `--color-focus-ring` | `color-mix` 50% magenta — focus rings |

### Tailwind utilities (`app/globals.css` `@theme inline`)

| Utility | Example |
|---------|---------|
| `border-border-default` | `border-t border-border-default` |
| `border-border-accent` | `border-border-accent` |
| `border-border-accent-strong` | App store badges, hero badge |
| `border-border-accent-hover` | `hover:border-border-accent-hover` |
| `bg-surface-panel` | Auth panel background |
| `bg-surface-accent-muted` | Accent callout / hero badge |
| `text-link` / `hover:text-link-hover` | Footer links, auth toggles |
| `ring-focus-ring` | Badge focus (via `focusRingClass`) |

### DRY helpers

`lib/brand/theme-classes.ts` — `panelShellClass`, `accentCalloutClass`, `linkAccentClass`, `focusRingClass`, etc.

### Migration status

| File | Status |
|------|--------|
| `components/marketing/app-store-badges.tsx` | ✅ semantic borders/surfaces/focus |
| `components/marketing/site-auth-form.tsx` | ✅ AuthPanel, SSO, separators |
| `components/marketing/site-footer.tsx` | ✅ borders + link hover |
| `components/marketing/auth-card.tsx` | ✅ tabs, shells, callouts, links |
| `components/marketing/home-hero.tsx` | ✅ hero badge border/bg |
| `app/globals.css` `.glass-panel` | ✅ uses `--color-border-default` / `--color-surface-panel` |
| Onboarding / dashboard / Clerk middleware | ⏸ not in scope |

### Usage in new components

```tsx
import { panelShellClass, linkAccentClass } from "@/lib/brand/theme-classes";

export function ExamplePanel() {
  return (
    <div className={panelShellClass}>
      <a href="/sign-in" className={linkAccentClass}>
        Sign in
      </a>
    </div>
  );
}
```

Or Tailwind-only: `className="rounded-2xl border border-border-default bg-surface-panel"`.

---

## 8. Decision log

| Date | Decision |
|------|----------|
| 2026-05-31 | Document Webflow variable model vs current stack; recommend primitive/semantic alias layer |
| 2026-06-01 | Implement semantic aliases + migrate marketing/auth shells; keep `--primary` / `--accent` shadcn mapping unchanged |
| 2026-06-01 | Add `styles/tokens/colors.css` + per-theme files; bridge legacy `--brand-*` to semantic `--color-*` (agent branch, not on `main` yet) |

---

## 9. Multi-palette themes (in progress)

**Branch:** `agent-cursor-semantic-design-tokens` (uncommitted WIP as of 2026-06-01)

| Piece | Location |
|-------|----------|
| Theme selector | `document.documentElement` attribute `data-theme` |
| Palette definitions | `lib/brand/themes/*.css` — dark + `*-light` pairs (`noir-magenta` / `noir-magenta-light`, `vera-classic` / `vera-classic-light`, `crm-dark` / `crm-light`, `damascus-steel-dark` / `damascus-steel-light`) |
| Global bridge | `styles/tokens/colors.css` → imported from `app/globals.css` |
| Landing scope | `lib/brand/landing-tokens.css` (CRM sections) |
| Dev tool | `components/dev/theme-switcher.tsx` — **not for production** |

**Production default (intended):** `noir-magenta` (`app/layout.tsx`).

**Dark palettes:** premium low-contrast scaling — tight gunmetal surface steps (~4–6 per channel), soft off-white text (`#e8eaed`–`#ece8e4`), accent-hued borders, accent glows at ~10–12% (not 35%); reference: `damascus-steel-dark`.

**`vera-classic`:** Original launch palette from initial commit `b4152d8` — dark chrome (`#07080a` / `#0d0f13`) with **gold accent `#d8b56d`** and gold hero glow (`rgba(216, 181, 109, 0.14)`). Not `noir-magenta` (magenta `#e41a76`). Dev preview: `data-theme="vera-classic"` or ThemeSwitcher label **VERA Classic**.

**`crm-dark`:** Dark CRM / charcoal SaaS landing palette — bg **`#111318`**, text **`#f5f5f6`**, muted **`#9ca3af`**, orange CTA **`#f97316`** / hover **`#fb923c`** with **white button label** on landing. Cool blue secondary **`#4a6fa5`**. Multi-stop hero/page gradients (no banding). `color-scheme: dark` (`html.dark`). Pairs with **`crm-light`** for dev comparison. Scoped block overrides: `[data-theme="crm-dark"] .crm-landing` in `lib/brand/landing-tokens.css`. Dev label **CRM Dark**.

**`crm-light`:** Light CRM / white SaaS landing palette — **white `#ffffff`**, text **`#050505`**, muted **`#6b6b6b`**, orange CTA **`#f97316`** / hover **`#ea580c`** with **black button label** on landing. Pastel blocks: peach `#fff0e8`, blue `#e8f4ff`, green `#e8f9ef`, lavender `#f0ebff`. Shadows `0 8px 30px rgba(0,0,0,0.06)`. `color-scheme: light` (no `html.dark`). Scoped pastel overrides: `[data-theme="crm-light"] .crm-landing` in `lib/brand/landing-tokens.css`. Dev label **CRM Light**.

**`damascus-steel-dark`:** Forged metal — gunmetal **`#1a1d22`**, cool gray text **`#e8eaed`**, silver-blue accent **`#7a8fa6`** / hover **`#9aa8bc`**. Metallic `--gradient-brand` (silver → accent → deep steel). Brushed highlights via `--gradient-page-accent`. Distinct from magenta/gold palettes. `color-scheme: dark` (`html.dark`). Dev label **Damascus Steel Dark**. Light pair **`damascus-steel-light`**: cool silver-white **`#eef1f5`**, accent **`#5a6d82`**. Legacy id **`damascus-steel`** migrates to **`damascus-steel-dark`** in dev localStorage.

**Light counterparts (`*-light`):** Each major dark palette has a dev-preview light variant in `lib/brand/themes/{id}-light.css`, registered in `lib/brand/light-themes.ts` and cycled after its dark sibling in `components/dev/theme-switcher.tsx`. Examples: **`noir-magenta-light`** (`#eef1f5` + magenta **`#e41a76`**), **`vera-classic-light`** (warm ivory + gold **`#d8b56d`**), **`damascus-steel-light`**.

**Light palette accent discipline:** On light themes, keep **`--color-accent`** (and hover/deep) for CTAs, links, focus rings, and chips. Page canvas tokens — **`--gradient-hero`**, **`--gradient-page-accent`**, **`--color-bg` / `--color-bg-soft` / `--color-surface`** — stay near-neutral (white → soft gray or warm/cool ivory); avoid accent-tinted radials or gold/magenta washes across the full page. Reference: **`crm-light`**, **`damascus-steel-light`**. Lower **`--color-accent-soft`** / **`--color-accent-glow`** for UI tints only. CRM landing pastels remain scoped in `landing-tokens.css` under `[data-theme="crm-light"] .crm-landing` only.

**Before Phase 3 launch:** pick one default palette, remove or gate dev switcher.
