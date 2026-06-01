/**
 * Shared Tailwind class strings for marketing/auth shells.
 * Prefer semantic utilities from @theme (border-border-default, bg-surface-panel, …).
 * Fluid type/spacing: lib/brand/fluid-metrics.css → @theme in app/globals.css.
 */

/** Hero / marketing headline */
export const fluidH1Class =
  "text-balance text-fluid-h1 font-semibold leading-fluid-h1 tracking-normal text-foreground";

/** HomeBranding motto — ≤2 lines in hero/auth columns (see fluid-metrics motto tokens). */
export const mottoWrapClass = "motto-wrap w-full";
export const fluidMottoH1Class =
  "brand-motto text-fluid-motto leading-fluid-motto text-pretty font-semibold tracking-normal text-foreground";
export const fluidCompactMottoClass =
  "brand-motto brand-motto--compact text-fluid-motto-compact leading-fluid-motto-compact text-pretty font-semibold tracking-normal text-foreground";

/** Subcopy under headlines */
export const fluidBodyClass =
  "text-pretty text-fluid-body leading-fluid-body text-muted-foreground";

export const fluidSmallClass = "text-fluid-small";
export const fluidCaptionClass = "text-fluid-caption";

export const fluidH2Class = "text-fluid-h2 font-semibold";

export const sectionPaddingYClass = "py-section";
export const sectionPaddingYLgClass = "py-section-lg";
export const fluidInlinePaddingClass = "px-fluid-inline";
export const fluidBlockGapClass = "space-y-fluid-block";
export const fluidGapLgClass = "gap-fluid-gap-lg";
export const fluidGapMdClass = "gap-fluid-gap-md";

export const contentShellClass = "mx-auto max-w-content";
export const authCardWidthClass = "w-full max-w-auth-card";

export const brandWordmarkClass = "brand-wordmark";

export const heroGridClass =
  "relative mx-auto grid w-full min-w-0 max-w-content grid-cols-1 gap-fluid-gap-lg px-fluid-inline lg:min-h-[calc(100vh-var(--hero-min-height-offset))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center";

export const borderDefaultClass = "border-border-default";

export const borderAccentClass = "border-border-accent";
export const borderAccentStrongClass = "border-border-accent-strong";
export const borderAccentHoverClass = "hover:border-border-accent-hover";

export const panelShellClass =
  "rounded-2xl border border-border-default bg-surface-panel px-fluid-inline py-fluid-card-y text-foreground";

export const panelSurfaceClass = "bg-surface-panel";
export const panelSurfaceHoverClass = "hover:bg-surface-panel-hover";
export const panelSurfaceEmphasisHoverClass = "hover:bg-surface-panel-emphasis";

export const accentCalloutClass =
  "rounded-2xl border border-border-accent bg-surface-accent-muted";

export const linkAccentClass =
  "text-link underline-offset-2 hover:text-link-hover hover:underline";

export const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
