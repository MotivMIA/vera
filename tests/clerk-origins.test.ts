import { afterEach, describe, expect, it } from "vitest";
import { collectClerkOrigins } from "@/lib/clerk/origins";

describe("collectClerkOrigins", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("always includes canonical production hosts", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://visual-era.vercel.app";

    const origins = collectClerkOrigins();

    expect(origins).toContain("https://visual-era.com");
    expect(origins).toContain("https://www.visual-era.com");
    expect(origins).toContain("https://visual-era.vercel.app");
  });

  it("includes local dev ports", () => {
    const origins = collectClerkOrigins();

    expect(origins).toContain("http://localhost:3001");
  });
});
