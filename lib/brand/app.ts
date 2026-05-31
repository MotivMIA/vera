/**
 * Mobile app store links for marketing surfaces (footer, etc.).
 * Set href when App Store / Google Play listings are live.
 */
export type AppStorePlatform = "apple" | "google";

export type AppStoreLink = {
  platform: AppStorePlatform;
  /** null = coming soon (footer shows disabled badge) */
  href: string | null;
  topLine: string;
  storeName: string;
};

/** Short copy shown under the footer app heading. */
export const APP_FOOTER_TAGLINE = "Creator tools on the go — coming soon";

export const APP_STORE_LINKS: readonly AppStoreLink[] = [
  {
    platform: "apple",
    // TODO: replace with live App Store URL when the iOS app ships
    href: null,
    topLine: "Download on the",
    storeName: "App Store",
  },
  {
    platform: "google",
    // TODO: replace with live Google Play URL when the Android app ships
    href: null,
    topLine: "Get it on",
    storeName: "Google Play",
  },
] as const;
