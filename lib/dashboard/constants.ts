/** Dashboard module — routes and placeholders until creator/admin/chatter specs land. */
export const DASHBOARD_ROUTES = {
  creator: "/creator",
  /** Site admin — marketing, locales, footer, theme; see docs/ADMIN_UI.md */
  admin: "/admin",
  chatter: "/chatter",
} as const;

/** Link to the site admin specification (repo docs). */
export const SITE_ADMIN_SPEC_PATH = "docs/ADMIN_UI.md";

export type DashboardRole = keyof typeof DASHBOARD_ROUTES;
