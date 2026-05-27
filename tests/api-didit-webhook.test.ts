import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const supabaseFromMock = vi.fn();
const supabaseUpdateMock = vi.fn();
const recordAuditLogMock = vi.fn();

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    DIDIT_WEBHOOK_SECRET: "test-webhook-secret",
    DIDIT_WEBHOOK_SECRET_PREVIOUS: "",
    DIDIT_WEBHOOK_DEBUG: false,
  }),
}));
vi.mock("@/lib/didit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/didit")>();
  return {
    ...actual,
    fetchDiditWebhookSecrets: vi.fn().mockResolvedValue([]),
  };
});
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    from: supabaseFromMock,
  }),
}));
vi.mock("@/lib/onboarding/audit", () => ({
  recordAuditLog: (...args: unknown[]) => recordAuditLogMock(...args),
}));

import { POST } from "@/app/api/didit/webhook/route";

function signDiditBody(rawBody: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

function diditRequest(body: Record<string, unknown>, secret = "test-webhook-secret") {
  const rawBody = JSON.stringify(body);
  return new NextRequest("http://localhost/api/didit/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-timestamp": String(Math.floor(Date.now() / 1000)),
      "x-signature": signDiditBody(rawBody, secret),
    },
    body: rawBody,
  });
}

describe("POST /api/didit/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseUpdateMock.mockResolvedValue({ error: null });
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { clerk_user_id: "user_123" } }),
          }),
        }),
      }),
      update: supabaseUpdateMock.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    });
  });

  it("returns 400 for invalid JSON payload", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/didit/webhook", {
        method: "POST",
        body: "not-json",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 for invalid signature", async () => {
    const response = await POST(
      diditRequest({ session_id: "sess_1", status: "Approved", vendor_data: "user_123" }, "wrong-secret"),
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 when vendor_data does not match session owner", async () => {
    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { clerk_user_id: "user_owner" } }),
          }),
        }),
      }),
      update: supabaseUpdateMock,
    });
    const response = await POST(
      diditRequest({ session_id: "sess_1", status: "Approved", vendor_data: "user_other" }),
    );
    expect(response.status).toBe(403);
  });

  it("accepts valid signed webhook", async () => {
    const response = await POST(
      diditRequest({ session_id: "sess_1", status: "Approved", vendor_data: "user_123", webhook_type: "status" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(recordAuditLogMock).toHaveBeenCalled();
  });
});
