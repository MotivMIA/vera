/**
 * Visual Era brand palette for JS/TS (Clerk theme, inline styles, etc.).
 * CSS source of truth: lib/brand/tokens.css — keep hex values in sync.
 */
export const brand = {
  magenta: "#E41A76",
  magentaBright: "#FF2D8A",
  magentaMid: "#C91C72",
  magentaDeep: "#830C60",
  purpleDeep: "#6B026B",
} as const;

export const brandRgb = {
  magenta: "228, 26, 118",
  purpleDeep: "107, 2, 107",
} as const;

/** Matches the logo letterform gradient (V → E). */
export const brandGradient = `linear-gradient(135deg, ${brand.magenta} 0%, ${brand.purpleDeep} 100%)` as const;
