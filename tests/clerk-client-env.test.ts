import { afterEach, describe, expect, it } from "vitest";
import {
  isClerkProductionKeyClient,
  isLocalDevHost,
  shouldUseClerkProxyClient,
} from "@/lib/clerk/client-env";

describe("clerk client-env", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("detects pk_live_ as production key", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_example";
    expect(isClerkProductionKeyClient()).toBe(true);
    expect(shouldUseClerkProxyClient()).toBe(true);
  });

  it("skips proxy for pk_test_ unless forced", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example";
    expect(isClerkProductionKeyClient()).toBe(false);
    expect(shouldUseClerkProxyClient()).toBe(false);
  });

  it("allows forced proxy with pk_test_", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example";
    process.env.NEXT_PUBLIC_CLERK_FORCE_PROXY = "true";
    expect(shouldUseClerkProxyClient()).toBe(true);
  });

  it("recognizes local dev hostnames", () => {
    expect(isLocalDevHost("localhost")).toBe(true);
    expect(isLocalDevHost("127.0.0.1")).toBe(true);
    expect(isLocalDevHost("visual-era.com")).toBe(false);
  });
});
