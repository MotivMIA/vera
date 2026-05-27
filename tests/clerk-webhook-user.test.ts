import { describe, expect, it } from "vitest";
import { clerkProfileFromWebhookUser, isClerkUserSyncEvent } from "@/lib/clerk/webhook-user";

describe("clerkProfileFromWebhookUser", () => {
  it("uses primary email when set", () => {
    const profile = clerkProfileFromWebhookUser({
      id: "user_abc",
      first_name: "Ada",
      last_name: "Lovelace",
      primary_email_address_id: "em_primary",
      email_addresses: [
        { id: "em_other", email_address: "other@example.com" },
        { id: "em_primary", email_address: "ada@example.com" },
      ],
    });
    expect(profile).toEqual({
      clerkUserId: "user_abc",
      email: "ada@example.com",
      fullName: "Ada Lovelace",
    });
  });

  it("falls back to first email and omits empty name", () => {
    const profile = clerkProfileFromWebhookUser({
      id: "user_xyz",
      email_addresses: [{ id: "em_1", email_address: "first@example.com" }],
    });
    expect(profile.email).toBe("first@example.com");
    expect(profile.fullName).toBeNull();
  });
});

describe("isClerkUserSyncEvent", () => {
  it("matches user lifecycle events only", () => {
    expect(isClerkUserSyncEvent("user.created")).toBe(true);
    expect(isClerkUserSyncEvent("user.updated")).toBe(true);
    expect(isClerkUserSyncEvent("user.deleted")).toBe(false);
    expect(isClerkUserSyncEvent("session.created")).toBe(false);
  });
});
