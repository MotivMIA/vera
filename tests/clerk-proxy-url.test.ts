import { afterEach, describe, expect, it } from "vitest";
import {
  getClerkProxyUrl,
  isClerkProductionKey,
  shouldUseClerkFrontendApiProxy,
} from "@/lib/clerk/proxy-url";

describe("getClerkProxyUrl", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null for pk_test_ (dev instance uses hosted FAPI)", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example";
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL = "http://localhost:3001/__clerk";
    expect(getClerkProxyUrl()).toBeNull();
    expect(shouldUseClerkFrontendApiProxy()).toBe(false);
  });

  it("uses explicit NEXT_PUBLIC_CLERK_PROXY_URL when pk_live_", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_example";
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL = "https://example.com/__clerk/";
    expect(getClerkProxyUrl()).toBe("https://example.com/__clerk");
    expect(isClerkProductionKey()).toBe(true);
  });

  it("returns null for pk_live_ on localhost (no broken local /__clerk proxy)", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_example";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
    delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
    expect(getClerkProxyUrl()).toBeNull();
  });

  it("allows forced proxy only when site URL is not localhost", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example";
    process.env.NEXT_PUBLIC_CLERK_FORCE_PROXY = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://visual-era.com";
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL = "https://visual-era.com/__clerk";
    expect(getClerkProxyUrl()).toBe("https://visual-era.com/__clerk");
  });

  it("ignores malformed NEXT_PUBLIC_CLERK_PROXY_URL copy-paste", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_example";
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL =
      "NEXT_PUBLIC_CLERK_PROXY_URL=https://app.visual-era.com/__clerk";
    process.env.VERCEL_ENV = "production";
    expect(getClerkProxyUrl()).toBe("https://visual-era.com/__clerk");
  });

  it("falls back to production canonical URL on Vercel production", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_example";
    delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    expect(getClerkProxyUrl()).toBe("https://visual-era.com/__clerk");
  });
});
