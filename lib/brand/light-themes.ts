/**
 * Light `data-theme` palettes — shared by footer marks, dev theme switcher, etc.
 */
export const LIGHT_THEME_IDS = [
  "crm-light",
  "noir-magenta-light",
  "vera-classic-light",
  "damascus-steel-light",
] as const;

export type LightThemeId = (typeof LIGHT_THEME_IDS)[number];

/** Footer social icons on light backgrounds (not app store badges — those keep native artwork). */
export const marketingFooterMarkClass = "marketing-footer-mark";

export const appStoreBadgeShellClass = "app-store-badge-shell";
export const appStoreBadgeOfficialShellClass = "app-store-badge-shell--official";
