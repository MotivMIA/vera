import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getAuthenticatedUserIdMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getAuthenticatedUserId: () => getAuthenticatedUserIdMock(),
}));

import { POST } from "@/app/api/documents/submit/route";

describe("POST /api/documents/submit auth", () => {
  it("returns 401 without authenticated user", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);
    const response = await POST(
      new NextRequest("http://localhost/api/documents/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid payload when authenticated", async () => {
    getAuthenticatedUserIdMock.mockResolvedValue("user_123");
    const response = await POST(
      new NextRequest("http://localhost/api/documents/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentType: "client_agreement" }),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toMatch(/Invalid document payload/i);
  });
});
