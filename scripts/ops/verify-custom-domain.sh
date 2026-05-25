#!/usr/bin/env bash
# Read-only: verify visual-era.com DNS and HTTP point toward production.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

CANONICAL="${CANONICAL_URL:-https://visual-era.com}"
VERCEL_DEFAULT="${VERCEL_URL:-https://visual-era.vercel.app}"
VERCEL_APEX_IP="${VERCEL_APEX_IP:-76.76.21.21}"

ops_log "Canonical production URL: ${CANONICAL}"
ops_log "Vercel default URL: ${VERCEL_DEFAULT}"

ops_require_dns_tools || { ops_finish "verify-custom-domain"; exit 1; }

apex_a="$(ops_dns_lookup "$OPS_DOMAIN" A)"
if echo "$apex_a" | grep -q "$VERCEL_APEX_IP"; then
  ops_ok "apex A includes Vercel IP ${VERCEL_APEX_IP}"
elif echo "$apex_a" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+'; then
  ops_warn "apex A present but not Vercel IP ${VERCEL_APEX_IP} — Cloudflare proxy or pending DNS"
  ops_log "  current: $(echo "$apex_a" | tr '\n' ' ')"
else
  ops_fail "no apex A record for ${OPS_DOMAIN}"
fi

if command -v curl >/dev/null 2>&1; then
  for url in "$CANONICAL" "$VERCEL_DEFAULT"; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$url/" 2>/dev/null || echo "000")"
    if [[ "$code" == "200" || "$code" == "307" || "$code" == "308" ]]; then
      ops_ok "HTTP ${code} for ${url}/"
    else
      ops_warn "HTTP ${code} for ${url}/"
    fi
  done
else
  ops_skip "curl not available"
fi

ops_finish "verify-custom-domain"
