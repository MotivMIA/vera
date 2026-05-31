import { describe, expect, it } from "vitest";
import { resolveNextOnboardingPath, resolveOnboardingRedirect } from "@/lib/onboarding/status";
import type { OnboardingSnapshot } from "@/lib/onboarding/status";

function snapshot(overrides: Partial<OnboardingSnapshot>): OnboardingSnapshot {
  return {
    currentStep: "consent",
    consentComplete: false,
    identityVerified: false,
    documentsComplete: false,
    ...overrides,
  };
}

describe("resolveNextOnboardingPath", () => {
  it("returns the earliest incomplete step", () => {
    expect(resolveNextOnboardingPath(snapshot({ consentComplete: false }))).toBe("/onboarding/consent");
    expect(
      resolveNextOnboardingPath(snapshot({ consentComplete: true, identityVerified: false })),
    ).toBe("/verify-identity");
    expect(
      resolveNextOnboardingPath(
        snapshot({ consentComplete: true, identityVerified: true, documentsComplete: false }),
      ),
    ).toBe("/documents");
    expect(
      resolveNextOnboardingPath(
        snapshot({
          consentComplete: true,
          identityVerified: true,
          documentsComplete: true,
          currentStep: "complete",
        }),
      ),
    ).toBe("/success");
  });
});

describe("resolveOnboardingRedirect", () => {
  it("returns null outside onboarding paths", () => {
    const s = snapshot({ consentComplete: false });
    expect(resolveOnboardingRedirect(s, "/")).toBeNull();
    expect(resolveOnboardingRedirect(s, "/sign-in")).toBeNull();
  });

  it("forces consent when incomplete", () => {
    const s = snapshot({ consentComplete: false });
    expect(resolveOnboardingRedirect(s, "/verify-identity")).toBe("/onboarding/consent");
    expect(resolveOnboardingRedirect(s, "/onboarding/consent")).toBeNull();
  });

  it("redirects away from consent when complete", () => {
    const s = snapshot({ consentComplete: true, identityVerified: false, currentStep: "identity" });
    expect(resolveOnboardingRedirect(s, "/onboarding/consent")).toBe("/verify-identity");
  });

  it("forces identity verification", () => {
    const s = snapshot({ consentComplete: true, identityVerified: false, currentStep: "identity" });
    expect(resolveOnboardingRedirect(s, "/documents")).toBe("/verify-identity");
    expect(resolveOnboardingRedirect(s, "/verify-identity")).toBeNull();
  });

  it("redirects from identity to documents when verified", () => {
    const s = snapshot({
      consentComplete: true,
      identityVerified: true,
      documentsComplete: false,
      currentStep: "documents",
    });
    expect(resolveOnboardingRedirect(s, "/verify-identity")).toBe("/documents");
  });

  it("forces documents when not complete", () => {
    const s = snapshot({
      consentComplete: true,
      identityVerified: true,
      documentsComplete: false,
      currentStep: "documents",
    });
    expect(resolveOnboardingRedirect(s, "/success")).toBe("/documents");
  });

  it("sends incomplete success visits to the next required step", () => {
    const s = snapshot({
      consentComplete: true,
      identityVerified: true,
      documentsComplete: false,
      currentStep: "documents",
    });
    expect(resolveOnboardingRedirect(s, "/success")).toBe("/documents");
  });

  it("redirects from documents to success when complete", () => {
    const s = snapshot({
      consentComplete: true,
      identityVerified: true,
      documentsComplete: true,
      currentStep: "complete",
    });
    expect(resolveOnboardingRedirect(s, "/documents")).toBe("/success");
    expect(resolveOnboardingRedirect(s, "/success")).toBeNull();
  });
});
