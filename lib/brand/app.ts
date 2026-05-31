/**
 * Mobile app store links for marketing surfaces (footer, etc.).
 * Set href when App Store / Google Play listings are live.
 */
export type AppStorePlatform = "apple" | "google";

export type AppStoreLink = {
  platform: AppStorePlatform;
  /** null = coming soon (badge renders without link) */
  href: string | null;
  topLine: string;
  storeName: string;
};

/** Short copy shown under the footer app heading. */
export const APP_FOOTER_TAGLINE =
  "Manage your creator profile, verification, and content from anywhere.";

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
    topLine: "GET IT ON",
    storeName: "Google Play",
  },
] as const;
