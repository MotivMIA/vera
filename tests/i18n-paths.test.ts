import { describe, expect, it } from "vitest";
import { pathWithLocale, stripLocalePrefix } from "@/lib/i18n/paths";
import { formatLocaleCookieHeader, LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";
import { authSignInPath } from "@/lib/routes";

describe("i18n paths", () => {
  it("prefixes non-default locales only (as-needed)", () => {
    expect(pathWithLocale("en", "/")).toBe("/");
    expect(pathWithLocale("en", "/sign-in")).toBe("/sign-in");
    expect(pathWithLocale("es", "/")).toBe("/es");
    expect(pathWithLocale("es", "/sign-in")).toBe("/es/sign-in");
    expect(pathWithLocale("it", "/")).toBe("/it");
    expect(pathWithLocale("it", "/login")).toBe("/it/login");
    expect(authSignInPath()).toBe("/sign-in");
    expect(authSignInPath("es")).toBe("/es/sign-in");
    expect(authSignInPath("it")).toBe("/it/sign-in");
  });

  it("strips locale prefix for pathname comparison", () => {
    expect(stripLocalePrefix("/es/legal/terms")).toBe("/legal/terms");
    expect(stripLocalePrefix("/it/login")).toBe("/login");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/sign-in")).toBe("/sign-in");
  });

  it("builds English switch target without /en prefix", () => {
    const pathname = stripLocalePrefix("/es");
    expect(pathWithLocale("en", pathname)).toBe("/");
    expect(pathWithLocale("en", stripLocalePrefix("/it/sign-in"))).toBe("/sign-in");
  });

  it("formats NEXT_LOCALE cookie for middleware", () => {
    expect(LOCALE_COOKIE_NAME).toBe("NEXT_LOCALE");
    expect(formatLocaleCookieHeader("en")).toContain("NEXT_LOCALE=en");
    expect(formatLocaleCookieHeader("es")).toContain("NEXT_LOCALE=es");
  });
});
