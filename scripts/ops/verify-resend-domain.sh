#!/usr/bin/env bash
# Read-only Resend domain verification status (requires RESEND_API_KEY).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

if ! ops_env_present RESEND_API_KEY; then
  ops_skip "RESEND_API_KEY not set — skipping Resend API check"
  ops_finish "verify-resend-domain"
  exit 0
fi

ops_require_cmd curl || ops_finish "verify-resend-domain" && exit 1

ops_log "Resend API: listing domains (read-only)..."
response="$(curl -sS -w '\n%{http_code}' \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  -H "Content-Type: application/json" \
  "https://api.resend.com/domains")"

body="$(echo "$response" | sed '$d')"
code="$(echo "$response" | tail -n1)"

if [[ "$code" != "200" ]]; then
  ops_fail "Resend domains API HTTP ${code}"
  ops_finish "verify-resend-domain"
  exit 1
fi

if echo "$body" | grep -q "$OPS_DOMAIN"; then
  ops_ok "Resend knows domain ${OPS_DOMAIN}"
else
  ops_warn "Domain ${OPS_DOMAIN} not found in Resend list — add when ready for transactional email"
fi

# Redacted summary only
ops_ok "Resend API reachable (response not logged in full)"

ops_finish "verify-resend-domain"
