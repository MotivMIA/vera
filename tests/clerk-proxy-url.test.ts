import { afterEach, describe, expect, it } from "vitest";
import { getClerkProxyUrl } from "@/lib/clerk/proxy-url";

describe("getClerkProxyUrl", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses explicit NEXT_PUBLIC_CLERK_PROXY_URL when set", () => {
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL = "https://example.com/__clerk/";
    expect(getClerkProxyUrl()).toBe("https://example.com/__clerk");
  });

  it("ignores malformed NEXT_PUBLIC_CLERK_PROXY_URL copy-paste", () => {
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL =
      "NEXT_PUBLIC_CLERK_PROXY_URL=https://app.visual-era.com/__clerk";
    process.env.VERCEL_ENV = "production";
    expect(getClerkProxyUrl()).toBe("https://visual-era.com/__clerk");
  });

  it("falls back to production canonical URL on Vercel production", () => {
    delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    expect(getClerkProxyUrl()).toBe("https://visual-era.com/__clerk");
  });
});
