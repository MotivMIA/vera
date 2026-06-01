# Styles

Global theme tokens live in `styles/tokens/colors.css` (imported from `app/globals.css`).

- Switch palettes: `data-theme` on `<html>` — dark: `noir-magenta`, `vera-classic`, `crm-dark`, `damascus-steel-dark`; light: `crm-light`, plus `*-light` counterparts (`noir-magenta-light`, `vera-classic-light`, `damascus-steel-light`).
- `vera-classic` — original launch gold (`#d8b56d` accent, commit `b4152d8`); not a magenta duplicate.
- `crm-dark` / `crm-light` — CRM landing pair (charcoal `#111318` / white `#ffffff`, shared orange CTA `#f97316`).
- `damascus-steel-dark` — forged metal (`#7a8fa6` silver-blue on `#1a1d22` gunmetal); brushed metallic gradients. Pairs with `damascus-steel-light`.
- Dev preview: floating switcher when `NODE_ENV=development` or `NEXT_PUBLIC_DEV_THEME_SWITCHER=true`.
- Per-theme definitions: `lib/brand/themes/*.css`.
