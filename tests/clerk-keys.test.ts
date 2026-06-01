import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyResolvedClerkEnv,
  getClerkPublishableKey,
  getClerkSecretKey,
  hasDualClerkKeys,
  isClerkDevContext,
  isClerkProductionPublishableKey,
} from "@/lib/clerk/keys";

describe("clerk keys", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function clearClerkEnv() {
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD;
    delete process.env.CLERK_SECRET_KEY_DEV;
    delete process.env.CLERK_SECRET_KEY_PROD;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  }

  it("detects dev context from NODE_ENV", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "development");
    expect(isClerkDevContext()).toBe(true);
  });

  it("detects dev context from localhost site URL", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
    expect(isClerkDevContext()).toBe(true);
  });

  it("uses dev keys in development", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "development");
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV = "pk_test_dev";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD = "pk_live_prod";
    process.env.CLERK_SECRET_KEY_DEV = "sk_test_dev";
    process.env.CLERK_SECRET_KEY_PROD = "sk_live_prod";

    expect(getClerkPublishableKey()).toBe("pk_test_dev");
    expect(getClerkSecretKey()).toBe("sk_test_dev");
    expect(hasDualClerkKeys()).toBe(true);
  });

  it("uses prod keys in production with production site URL", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_SITE_URL = "https://visual-era.com";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV = "pk_test_dev";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD = "pk_live_prod";
    process.env.CLERK_SECRET_KEY_DEV = "sk_test_dev";
    process.env.CLERK_SECRET_KEY_PROD = "sk_live_prod";

    expect(getClerkPublishableKey()).toBe("pk_live_prod");
    expect(getClerkSecretKey()).toBe("sk_live_prod");
  });

  it("falls back to legacy single keys when dual keys are absent", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "development");
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_legacy";
    process.env.CLERK_SECRET_KEY = "sk_test_legacy";

    expect(hasDualClerkKeys()).toBe(false);
    expect(getClerkPublishableKey()).toBe("pk_test_legacy");
    expect(getClerkSecretKey()).toBe("sk_test_legacy");
  });

  it("falls back to legacy keys when selected dual slot is empty", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "development");
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD = "pk_live_prod";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_legacy";

    expect(getClerkPublishableKey()).toBe("pk_test_legacy");
  });

  it("applyResolvedClerkEnv writes resolved keys to process.env", () => {
    clearClerkEnv();
    vi.stubEnv("NODE_ENV", "development");
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV = "pk_test_dev";
    process.env.CLERK_SECRET_KEY_DEV = "sk_test_dev";

    applyResolvedClerkEnv();

    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_dev");
    expect(process.env.CLERK_SECRET_KEY).toBe("sk_test_dev");
  });

  it("detects production publishable keys", () => {
    expect(isClerkProductionPublishableKey("pk_live_example")).toBe(true);
    expect(isClerkProductionPublishableKey("pk_test_example")).toBe(false);
  });
});
