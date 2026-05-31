/** Dashboard module — routes and placeholders until creator/admin/chatter specs land. */
export const DASHBOARD_ROUTES = {
  creator: "/creator",
  admin: "/admin",
  chatter: "/chatter",
} as const;

export type DashboardRole = keyof typeof DASHBOARD_ROUTES;
