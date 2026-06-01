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

/**
 * Full marketing badge artwork (official layout).
 * SVGs omit outer bezel strokes — accent border comes from `AppStoreBadges` shell.
 */
export const APP_STORE_BADGE_ASSETS = {
  apple: {
    src: "/badges/app-store-badge.svg",
    width: 135,
    height: 40,
    ariaLabel: "Download on the App Store",
  },
  google: {
    src: "/badges/google-play-badge.svg",
    width: 180,
    height: 53,
    ariaLabel: "Get it on Google Play",
  },
} as const;

/** Icon-only assets for the themed styled variant. */
export const APP_STORE_ICON_ASSETS = {
  apple: {
    src: "/badges/apple.svg",
    width: 28,
    height: 35,
  },
  google: {
    src: "/badges/play.svg",
    width: 24,
    height: 26,
  },
} as const;

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
