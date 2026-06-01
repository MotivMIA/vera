import { describe, expect, it } from "vitest";
import { pathWithLocale, stripLocalePrefix } from "@/lib/i18n/paths";
import { authSignInPath } from "@/lib/routes";

describe("i18n paths", () => {
  it("prefixes non-default locales only (as-needed)", () => {
    expect(pathWithLocale("en", "/")).toBe("/");
    expect(pathWithLocale("en", "/sign-in")).toBe("/sign-in");
    expect(pathWithLocale("es", "/")).toBe("/es");
    expect(pathWithLocale("es", "/sign-in")).toBe("/es/sign-in");
    expect(authSignInPath()).toBe("/sign-in");
    expect(authSignInPath("es")).toBe("/es/sign-in");
  });

  it("strips locale prefix for pathname comparison", () => {
    expect(stripLocalePrefix("/es/legal/terms")).toBe("/legal/terms");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/sign-in")).toBe("/sign-in");
  });
});
