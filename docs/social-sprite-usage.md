# Social icons (color + monochrome sprite)

Minimal brand icons for marketing and auth UI. Only symbols the site uses are maintained — not the full Simple Icons catalog.

**Source of truth:** `lib/brand/site-social-icons.ts` (currently `google`, `x`, `instagram`).

**Legacy squircle reference:** `public/brand/legacy/iconexa.jpg` — see [design/ICON_LEGACY.md](design/ICON_LEGACY.md).

## Colored icons (default)

Flat, transparent full-color marks (no squircle tile) live at:

- `public/icons/social/google.svg` — four-color Google “G”
- `public/icons/social/x.svg` — X glyph (light mark for dark UI)
- `public/icons/social/instagram.svg` — gradient Instagram camera mark

Paths are defined in `lib/brand/brand-social-icons.ts`. The site supplies panel/button backgrounds; icon files must not include background rects or gradient tiles.

```tsx
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";

<SocialSpriteIcon variant="google" className="size-5" />
<SocialSpriteIcon variant="google" tone="mono" className="size-5 text-foreground" />
```

`BrandSocialIcon` is an alias for the same component. Default `tone` is `"color"`.

## Monochrome sprite

Regenerate from Simple Icons:

```bash
npm run sprites:social
```

Writes:

- `public/social-sprite.svg` — hidden root `<svg>` with one `<symbol id="…">` per site list entry (24×24, `fill="currentColor"`)
- `docs/social-sprite-report.json` — generated vs missing icons

To add an icon: extend `SITE_SOCIAL_ICON_MAP`, add a flat colored SVG under `public/icons/social/` (no background), wire `BRAND_SOCIAL_ICON_PATHS`, then re-run the script for the mono sprite.

Missing slugs fail the script with `console.warn` and exit code `1`.

### Inline `<use>` (mono only)

```tsx
<svg className="size-5 text-[#f6f4ef]" viewBox="0 0 24 24" aria-hidden>
  <use href="/social-sprite.svg#google" />
</svg>
```

Or `tone="mono"` on `SocialSpriteIcon`.

## App store badges

Download badges live under `public/badges/` and are **not** part of the social icon set.

## License

Simple Icons (monochrome sprite) are [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). Colored SVGs use official brand colors; check brand guidelines for trademark use in production UI.
