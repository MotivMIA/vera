import {
  SITE_SOCIAL_ICON_IDS,
  SITE_SOCIAL_ICON_MAP,
  type SiteSocialIconId,
} from "@/lib/brand/site-social-icons";

/** Canonical legacy raster pack (design reference only — not used in production UI). */
export const ICONEXA_LEGACY_PATH = "/brand/legacy/iconexa.jpg";

/** Full-color flat marks (transparent SVG, no tile) for marketing and auth UI. */
export const BRAND_SOCIAL_ICON_PATHS: Record<SiteSocialIconId, string> = {
  google: "/icons/social/google.svg",
  x: "/icons/social/x.svg",
  instagram: "/icons/social/instagram.svg",
};

export type BrandSocialIconVariant = SiteSocialIconId;

export const BRAND_SOCIAL_ICON_LABELS: Record<BrandSocialIconVariant, string> =
  Object.fromEntries(
    SITE_SOCIAL_ICON_IDS.map((id) => [id, SITE_SOCIAL_ICON_MAP[id].label]),
  ) as Record<BrandSocialIconVariant, string>;
