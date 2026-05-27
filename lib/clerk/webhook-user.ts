/** Minimal Clerk user payload shape from user.created / user.updated webhooks. */
export type ClerkWebhookUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ id: string; email_address: string }>;
};

export function clerkProfileFromWebhookUser(user: ClerkWebhookUser) {
  const primaryId = user.primary_email_address_id;
  const email =
    user.email_addresses?.find((entry) => entry.id === primaryId)?.email_address ??
    user.email_addresses?.[0]?.email_address ??
    null;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || null;
  return { clerkUserId: user.id, email, fullName };
}

export function isClerkUserSyncEvent(type: string) {
  return type === "user.created" || type === "user.updated";
}
