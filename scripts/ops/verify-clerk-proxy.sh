#!/usr/bin/env bash
# Test whether Clerk will accept the Frontend API proxy (before Dashboard save).
# Requires production CLERK_SECRET_KEY (sk_live_...) — copy from Vercel, do not paste in chat.
set -euo pipefail

PROXY_URL="${CLERK_PROXY_URL:-https://visual-era.com/__clerk}"
PROXY_URL="${PROXY_URL%/}"

if [[ -z "${CLERK_SECRET_KEY:-}" ]]; then
  echo "error: export CLERK_SECRET_KEY=sk_live_... (from Vercel Production or Clerk → Production → API Keys)" >&2
  exit 1
fi

if [[ "${CLERK_SECRET_KEY}" == sk_test_* ]]; then
  echo "error: sk_test_ only checks the *development* instance. visual-era.com uses pk_live_." >&2
  echo "       Copy sk_live_ from Vercel → visual-era → Settings → Environment Variables → Production." >&2
  exit 1
fi

if [[ "$PROXY_URL" == *"app.visual-era.com"* ]]; then
  echo "error: use https://visual-era.com/__clerk (no app. subdomain) unless that host is live on Vercel." >&2
  exit 1
fi

echo "Listing domains…"
domains_json="$(curl -fsSL "https://api.clerk.com/v1/domains" \
  -H "Authorization: Bearer ${CLERK_SECRET_KEY}")"

target_host="$(python3 -c "from urllib.parse import urlparse; print(urlparse('${PROXY_URL}').hostname or '')")"

domain_id="$(echo "$domains_json" | python3 -c "
import json, sys
data = json.load(sys.stdin).get('data', [])
target = '${target_host}'
for d in data:
    if d.get('name') == target:
        print(d['id'])
        sys.exit(0)
for d in data:
    if 'visual-era' in (d.get('frontend_api_url') or ''):
        print(d['id'])
        sys.exit(0)
print(data[0]['id'] if data else '')
")"

if [[ -z "$domain_id" ]]; then
  echo "error: no domain id from Clerk API" >&2
  exit 1
fi

echo "Running proxy check for ${PROXY_URL} (domain ${domain_id})…"
result="$(curl -fsSL -X POST "https://api.clerk.com/v1/proxy_checks" \
  -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"domain_id\":\"${domain_id}\",\"proxy_url\":\"${PROXY_URL}\"}")"

echo "$result" | python3 -m json.tool

successful="$(echo "$result" | python3 -c "import json,sys; print('yes' if json.load(sys.stdin).get('successful') else 'no')")"
if [[ "$successful" != "yes" ]]; then
  echo ""
  echo "FAIL: Clerk proxy check did not pass — Dashboard will block saving the proxy URL."
  echo "Fix middleware/deploy first, then re-run. See docs/ops/CLERK_PROXY_SETUP.md"
  exit 1
fi

echo ""
echo "OK: proxy check passed. Run: ./scripts/ops/configure-clerk-proxy.sh"
