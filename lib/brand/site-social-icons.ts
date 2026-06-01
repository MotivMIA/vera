/**
 * Brand icons shipped in `public/social-sprite.svg` — only what the site uses.
 * Regenerate paths: `npm run sprites:social` (reads this map).
 *
 * Visual style reference: `public/brand/legacy/iconexa.jpg` (squircle tiles) — see `docs/design/ICON_LEGACY.md`.
 * Colored UI: flat `public/icons/social/*.svg` (transparent, brand paths only).
 * Monochrome sprite paths from Simple Icons (`npm run sprites:social`).
 */
export const SITE_SOCIAL_ICON_MAP = {
  google: { slug: "google", label: "Google" },
  x: { slug: "x", label: "X" },
  instagram: { slug: "instagram", label: "Instagram" },
} as const;

export type SiteSocialIconId = keyof typeof SITE_SOCIAL_ICON_MAP;

/** Kebab-case symbol ids in the generated SVG sprite. */
export const SITE_SOCIAL_ICON_IDS = Object.keys(
  SITE_SOCIAL_ICON_MAP,
) as SiteSocialIconId[];
