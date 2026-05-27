import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureUserRowMock = vi.fn();

vi.mock("@/lib/onboarding/status", () => ({
  ensureUserRow: (...args: unknown[]) => ensureUserRowMock(...args),
}));

import { syncClerkUserFromWebhookEvent } from "@/lib/clerk/sync-user";

describe("syncClerkUserFromWebhookEvent", () => {
  beforeEach(() => {
    ensureUserRowMock.mockReset();
    ensureUserRowMock.mockResolvedValue(undefined);
  });

  it("ignores unrelated event types", async () => {
    const result = await syncClerkUserFromWebhookEvent({ type: "session.created", data: {} });
    expect(result).toEqual({ synced: false });
    expect(ensureUserRowMock).not.toHaveBeenCalled();
  });

  it("upserts users row on user.created", async () => {
    const result = await syncClerkUserFromWebhookEvent({
      type: "user.created",
      data: {
        id: "user_123",
        first_name: "Test",
        last_name: "User",
        primary_email_address_id: "em_1",
        email_addresses: [{ id: "em_1", email_address: "test@example.com" }],
      },
    });
    expect(result.synced).toBe(true);
    expect(ensureUserRowMock).toHaveBeenCalledWith("user_123", {
      email: "test@example.com",
      fullName: "Test User",
    });
  });
});
