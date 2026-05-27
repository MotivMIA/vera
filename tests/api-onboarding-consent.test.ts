import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
const hasConsentAcceptedMock = vi.fn();
const recordConsentAcceptedMock = vi.fn();
const getClerkProfileMock = vi.fn();
const recordAuditLogMock = vi.fn();
const rateLimitMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => authMock(),
}));
vi.mock("@/lib/onboarding/status", () => ({
  hasConsentAccepted: (...args: unknown[]) => hasConsentAcceptedMock(...args),
  recordConsentAccepted: (...args: unknown[]) => recordConsentAcceptedMock(...args),
}));
vi.mock("@/lib/onboarding/guards", () => ({
  getClerkProfile: () => getClerkProfileMock(),
}));
vi.mock("@/lib/onboarding/audit", () => ({
  recordAuditLog: (...args: unknown[]) => recordAuditLogMock(...args),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));
vi.mock("@/lib/security", () => ({
  getClientIp: () => "127.0.0.1",
}));

import { POST } from "@/app/api/onboarding/consent/route";

describe("POST /api/onboarding/consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockReturnValue({ allowed: true });
    getClerkProfileMock.mockResolvedValue({ email: "user@example.com", fullName: "Test User" });
  });

  it("returns 401 without auth", async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = await POST(new NextRequest("http://localhost/api/onboarding/consent", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("returns alreadyAccepted when consent exists", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    hasConsentAcceptedMock.mockResolvedValue(true);
    const response = await POST(new NextRequest("http://localhost/api/onboarding/consent", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, alreadyAccepted: true });
    expect(recordConsentAcceptedMock).not.toHaveBeenCalled();
  });

  it("records consent for authenticated user", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    hasConsentAcceptedMock.mockResolvedValue(false);
    const response = await POST(new NextRequest("http://localhost/api/onboarding/consent", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(recordConsentAcceptedMock).toHaveBeenCalledWith("user_123", {
      email: "user@example.com",
      fullName: "Test User",
    });
    expect(recordAuditLogMock).toHaveBeenCalled();
  });
});
