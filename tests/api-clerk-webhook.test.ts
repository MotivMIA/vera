import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const verifyWebhookMock = vi.fn();
const syncClerkUserFromWebhookEventMock = vi.fn();

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: (...args: unknown[]) => verifyWebhookMock(...args),
}));
vi.mock("@/lib/clerk/sync-user", () => ({
  syncClerkUserFromWebhookEvent: (...args: unknown[]) => syncClerkUserFromWebhookEventMock(...args),
}));

import { POST } from "@/app/api/webhooks/clerk/route";

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncClerkUserFromWebhookEventMock.mockResolvedValue({ synced: true });
  });

  it("returns 400 when signature verification fails", async () => {
    verifyWebhookMock.mockRejectedValue(new Error("bad signature"));
    const response = await POST(new NextRequest("http://localhost/api/webhooks/clerk", { method: "POST" }));
    expect(response.status).toBe(400);
    expect(syncClerkUserFromWebhookEventMock).not.toHaveBeenCalled();
  });

  it("syncs user and returns received on valid webhook", async () => {
    const event = { type: "user.created", data: { id: "user_123" } };
    verifyWebhookMock.mockResolvedValue(event);
    const response = await POST(new NextRequest("http://localhost/api/webhooks/clerk", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(syncClerkUserFromWebhookEventMock).toHaveBeenCalledWith(event);
  });
});
