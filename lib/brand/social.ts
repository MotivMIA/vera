/**
 * Public social profile URLs for marketing surfaces (footer, etc.).
 * Update href values when official accounts are confirmed.
 */
import type { SiteSocialIconId } from "@/lib/brand/site-social-icons";

export type SocialLink = {
  label: string;
  href: string;
  /** Symbol id in `public/social-sprite.svg`. */
  icon: SiteSocialIconId;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "X (Twitter)",
    icon: "x",
    // TODO: replace with live handle when confirmed
    href: "https://x.com/visualera",
  },
  {
    label: "Instagram",
    icon: "instagram",
    // TODO: replace with live handle when confirmed
    href: "https://instagram.com/visualera",
  },
] as const;

/** Footer legal nav — hub plus core policies only (not every LEGAL_DOCUMENTS entry). */
export const FOOTER_LEGAL_SLUGS = ["terms", "privacy"] as const;
