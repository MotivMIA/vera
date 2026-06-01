#!/usr/bin/env bash
# One-time helper: create .env.dev and .env.prod from an existing .env (if present).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LEGACY="${ROOT}/.env"

if [[ ! -f "$LEGACY" ]]; then
  echo "error: no .env to split — copy templates first:" >&2
  echo "  cp .env.dev.example .env.dev" >&2
  echo "  cp .env.prod.example .env.prod" >&2
  exit 1
fi

DEV_OUT="${ROOT}/.env.dev"
PROD_OUT="${ROOT}/.env.prod"

if [[ -f "$DEV_OUT" || -f "$PROD_OUT" ]]; then
  echo "error: .env.dev or .env.prod already exists — remove or rename before splitting" >&2
  exit 1
fi

cp "$LEGACY" "$DEV_OUT"
cp "$LEGACY" "$PROD_OUT"

# Dev overrides
if grep -q '^NEXT_PUBLIC_SITE_URL=' "$DEV_OUT"; then
  sed -i '' 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3001|' "$DEV_OUT" 2>/dev/null \
    || sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3001|' "$DEV_OUT"
else
  echo "NEXT_PUBLIC_SITE_URL=http://localhost:3001" >> "$DEV_OUT"
fi

if grep -q '^ALLOW_DEV_AUTH_BYPASS=' "$DEV_OUT"; then
  sed -i '' 's|^ALLOW_DEV_AUTH_BYPASS=.*|ALLOW_DEV_AUTH_BYPASS=true|' "$DEV_OUT" 2>/dev/null \
    || sed -i 's|^ALLOW_DEV_AUTH_BYPASS=.*|ALLOW_DEV_AUTH_BYPASS=true|' "$DEV_OUT"
else
  echo "ALLOW_DEV_AUTH_BYPASS=true" >> "$DEV_OUT"
fi

# Strip prod-only proxy hints from dev (optional cleanup)
sed -i '' '/^NEXT_PUBLIC_CLERK_PROXY_URL=/d' "$DEV_OUT" 2>/dev/null \
  || sed -i '/^NEXT_PUBLIC_CLERK_PROXY_URL=/d' "$DEV_OUT" 2>/dev/null || true
sed -i '' '/^NEXT_PUBLIC_CLERK_FORCE_PROXY=/d' "$DEV_OUT" 2>/dev/null \
  || sed -i '/^NEXT_PUBLIC_CLERK_FORCE_PROXY=/d' "$DEV_OUT" 2>/dev/null || true

# Prod overrides
if grep -q '^NEXT_PUBLIC_SITE_URL=' "$PROD_OUT"; then
  sed -i '' 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://visual-era.com|' "$PROD_OUT" 2>/dev/null \
    || sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://visual-era.com|' "$PROD_OUT"
else
  echo "NEXT_PUBLIC_SITE_URL=https://visual-era.com" >> "$PROD_OUT"
fi

sed -i '' '/^ALLOW_DEV_AUTH_BYPASS=/d' "$PROD_OUT" 2>/dev/null \
  || sed -i '/^ALLOW_DEV_AUTH_BYPASS=/d' "$PROD_OUT" 2>/dev/null || true

echo "created:"
echo "  ${DEV_OUT}  (localhost + ALLOW_DEV_AUTH_BYPASS=true)"
echo "  ${PROD_OUT} (https://visual-era.com, no dev bypass)"
echo ""
echo "Review both files, then use: npm run dev  (loads .env.dev)"
