/**
 * Public social profile URLs for marketing surfaces (footer, etc.).
 * Update href values when official accounts are confirmed.
 */
export type SocialLink = {
  label: string;
  href: string;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "X (Twitter)",
    // TODO: replace with live handle when confirmed
    href: "https://x.com/visualera",
  },
  {
    label: "Instagram",
    // TODO: replace with live handle when confirmed
    href: "https://instagram.com/visualera",
  },
] as const;

/** Footer legal nav — hub plus core policies only (not every LEGAL_DOCUMENTS entry). */
export const FOOTER_LEGAL_SLUGS = ["terms", "privacy"] as const;
