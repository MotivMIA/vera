#!/usr/bin/env bash
# Configure Clerk Frontend API proxy for visual-era.com (production instance).
# Requires CLERK_SECRET_KEY for the *production* Clerk instance (sk_live_...).
set -euo pipefail

PROXY_URL="${CLERK_PROXY_URL:-https://visual-era.com/__clerk}"
PROXY_URL="${PROXY_URL%/}"

if [[ -z "${CLERK_SECRET_KEY:-}" ]]; then
  echo "error: CLERK_SECRET_KEY is not set." >&2
  echo "Use the production secret (sk_live_...) from Clerk Dashboard → API Keys." >&2
  exit 1
fi

if [[ "${CLERK_SECRET_KEY}" == sk_test_* ]]; then
  echo "warn: CLERK_SECRET_KEY is a test key — this updates the dev instance, not production." >&2
  echo "      For visual-era.com, use sk_live_... from the production Clerk instance." >&2
fi

echo "Listing Clerk domains…"
domains_json="$(curl -fsSL "https://api.clerk.com/v1/domains" \
  -H "Authorization: Bearer ${CLERK_SECRET_KEY}")"

domain_id="$(echo "$domains_json" | python3 -c "
import json, sys
data = json.load(sys.stdin).get('data', [])
if not data:
    sys.exit(1)
# Prefer domain whose FAPI mentions visual-era
for d in data:
    fapi = d.get('frontend_api_url') or ''
    if 'visual-era' in fapi:
        print(d['id'])
        break
else:
    print(data[0]['id'])
" 2>/dev/null)" || {
  echo "error: no domains returned from Clerk API" >&2
  exit 1
}

echo "Setting proxy_url=${PROXY_URL} on domain ${domain_id}…"
curl -fsSL -X PATCH "https://api.clerk.com/v1/domains/${domain_id}" \
  -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"proxy_url\":\"${PROXY_URL}\"}" | python3 -m json.tool

echo ""
echo "ok: Clerk proxy configured."
echo "Also set on Vercel (Production):"
echo "  NEXT_PUBLIC_SITE_URL=https://visual-era.com"
echo "  NEXT_PUBLIC_CLERK_PROXY_URL=${PROXY_URL}"
echo "Then redeploy production."
