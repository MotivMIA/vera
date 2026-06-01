import { describe, expect, it } from "vitest";
import {
  AUTH_SIGN_IN_PATH,
  AUTH_SIGN_UP_PATH,
  authSignInPath,
  DOCUMENTS_PATH,
  ONBOARDING_ENTRY_PATH,
  SUCCESS_PATH,
  VERIFY_IDENTITY_PATH,
} from "@/lib/routes";

describe("lib/routes", () => {
  it("exposes stable public paths", () => {
    expect(ONBOARDING_ENTRY_PATH).toBe("/onboarding");
    expect(AUTH_SIGN_IN_PATH).toBe("/sign-in");
    expect(authSignInPath()).toBe("/sign-in");
    expect(AUTH_SIGN_UP_PATH).toBe("/sign-up");
    expect(VERIFY_IDENTITY_PATH).toBe("/verify-identity");
    expect(DOCUMENTS_PATH).toBe("/documents");
    expect(SUCCESS_PATH).toBe("/success");
  });
});
