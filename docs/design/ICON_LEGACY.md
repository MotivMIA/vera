# Social icon legacy reference (iconexa)

The **iconexa** pack (`public/brand/legacy/iconexa.jpg`) is a **design reference** for the older squircle-tile style (colored or black rounded squares behind each mark). Production UI uses **flat, transparent** SVGs under `public/icons/social/` — glyph only, no tile — so icons sit on site panels (`bg-white/[0.04]`, `border-accent/30`, etc.).

## Canonical legacy asset

| Field | Value |
|-------|--------|
| Path | `public/brand/legacy/iconexa.jpg` |
| Public URL | `/brand/legacy/iconexa.jpg` |
| Dimensions | 1000 × 354 px |
| Size | ~302 KB (single canonical copy — do not duplicate at repo root) |

## Legacy style (iconexa / 2024 pack) — not shipped in UI

- **Container:** Rounded square (squircle) tile behind the mark
- **Google:** White tile, four-color “G”
- **X:** Black tile, white “X”
- **Instagram:** Gradient tile, white camera outline

## Production style (flat marks)

| Id | Colored SVG | Notes |
|----|-------------|--------|
| `google` | `/icons/social/google.svg` | Four-color “G”, no background |
| `x` | `/icons/social/x.svg` | X glyph only (`#F6F4EF` on dark UI; no black tile) |
| `instagram` | `/icons/social/instagram.svg` | Gradient camera mark, no squircle fill |

Monochrome fallbacks: `public/social-sprite.svg` (`npm run sprites:social`, Simple Icons, `currentColor`).

## Site icons in the legacy pack

Only these appear in both the legacy JPG and the site set (`lib/brand/site-social-icons.ts`):

| Id | Legacy pack (colored squircle row) |
|----|-------------------------------------|
| `instagram` | Main grid, colored row — **column 1** |
| `google` | Main grid, colored row — **column 10** |
| `x` | Main grid, colored row — **column 15** |

The JPG also includes hero samples and alternate styles (solid black squircles, outlines, glyph-only). Use the **first colored squircle row** under the “HUGE PACK SOCIAL MEDIA ICONS 2024” banner when comparing to legacy tiles.

## Approximate crop regions (colored squircle row)

Image size: **1000 × 354**. Main grid ~y ≈ 72–320; icons ~32–36 px square.

| Icon | Col | Approx. pixel box (x, y, w, h) |
|------|-----|--------------------------------|
| instagram | 1 | (8, 88, 36, 36) |
| google | 10 | (308, 88, 36, 36) |
| x | 15 | (458, 88, 36, 36) |

Coordinates are approximate. For precise extraction, open `iconexa.jpg` in a design tool.

## Related assets

| Asset | Role |
|-------|------|
| `public/icons/social/*.svg` | Production full-color flat icons |
| `public/social-sprite.svg` | Monochrome `currentColor` sprite (`SocialSpriteIcon` `tone="mono"`) |
| `public/brand/social-sprite.jpg` | Older raster sprite sheet (dev preview only) |

## Regenerate monochrome sprite

```bash
npm run sprites:social
```

See [social-sprite-usage.md](../social-sprite-usage.md).
