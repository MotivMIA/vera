/**
 * Shared Tailwind class strings for marketing/auth shells.
 * Prefer semantic utilities from @theme (border-border-default, bg-surface-panel, …).
 */

export const borderDefaultClass = "border-border-default";

export const borderAccentClass = "border-border-accent";
export const borderAccentStrongClass = "border-border-accent-strong";
export const borderAccentHoverClass = "hover:border-border-accent-hover";

export const panelShellClass =
  "rounded-2xl border border-border-default bg-surface-panel px-5 py-6 text-foreground";

export const panelSurfaceClass = "bg-surface-panel";
export const panelSurfaceHoverClass = "hover:bg-surface-panel-hover";
export const panelSurfaceEmphasisHoverClass = "hover:bg-surface-panel-emphasis";

export const accentCalloutClass =
  "rounded-2xl border border-border-accent bg-surface-accent-muted";

export const linkAccentClass =
  "text-link underline-offset-2 hover:text-link-hover hover:underline";

export const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
