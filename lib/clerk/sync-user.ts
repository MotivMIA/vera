import { clerkProfileFromWebhookUser, isClerkUserSyncEvent, type ClerkWebhookUser } from "@/lib/clerk/webhook-user";
import { ensureUserRow } from "@/lib/onboarding/status";

export async function syncClerkUserFromWebhookEvent(event: { type: string; data: unknown }) {
  if (!isClerkUserSyncEvent(event.type)) {
    return { synced: false as const };
  }

  const profile = clerkProfileFromWebhookUser(event.data as ClerkWebhookUser);
  await ensureUserRow(profile.clerkUserId, { email: profile.email, fullName: profile.fullName });
  return { synced: true as const, ...profile };
}
