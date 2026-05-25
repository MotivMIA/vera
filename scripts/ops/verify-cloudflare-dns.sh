#!/usr/bin/env bash
# Read-only DNS checks for OPS_DOMAIN (public dig + optional Cloudflare API).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

ops_require_dns_tools || { ops_finish "verify-cloudflare-dns"; exit 1; }

ops_log "Checking public DNS for ${OPS_DOMAIN}..."

for host in "$OPS_DOMAIN" "www.${OPS_DOMAIN}"; do
  if a_records="$(ops_dns_lookup "$host" A)" && [[ -n "$a_records" ]]; then
    ops_ok "${host} A records present"
  else
    ops_fail "${host} has no A records (or dig failed)"
  fi
done

if ops_env_present CLOUDFLARE_API_TOKEN && ops_env_present CLOUDFLARE_ZONE_ID; then
  ops_require_cmd curl || true
  if command -v curl >/dev/null 2>&1; then
    ops_log "Cloudflare API: listing DNS records (read-only)..."
    http_code="$(curl -sS -o /tmp/cf-dns.json -w '%{http_code}' \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?per_page=50")"
    if [[ "$http_code" == "200" ]]; then
      count="$(grep -c '"id"' /tmp/cf-dns.json 2>/dev/null || echo 0)"
      ops_ok "Cloudflare API returned DNS records (count≈${count})"
      rm -f /tmp/cf-dns.json
    else
      ops_fail "Cloudflare API DNS list failed (HTTP ${http_code})"
      rm -f /tmp/cf-dns.json
    fi
  fi
else
  ops_skip "CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID not set — public dig only"
fi

ops_finish "verify-cloudflare-dns"
