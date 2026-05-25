#!/usr/bin/env bash
# Read-only MX / SPF checks for transactional email (public DNS).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

ops_require_dns_tools || { ops_finish "verify-email-dns"; exit 1; }

ops_log "Checking email DNS for ${OPS_DOMAIN}..."

mx="$(ops_dns_mx "$OPS_DOMAIN")"
if [[ -n "$mx" ]]; then
  ops_ok "MX records found for ${OPS_DOMAIN}"
  ops_log "     $(echo "$mx" | tr '\n' ' ')"
else
  ops_warn "No MX records — expected after Cloudflare Email Routing (see docs/ops/CLOUDFLARE_EMAIL_ROUTING.md)"
fi

spf="$(ops_dns_txt "$OPS_DOMAIN" | grep -i 'v=spf1' || true)"
if [[ -n "$spf" ]]; then
  ops_ok "SPF TXT present"
else
  ops_warn "No SPF TXT at apex — may be OK if sending via Resend subdomain only"
fi

# Common Resend DKIM selector (verify in Resend dashboard if different).
for dkim_host in "resend._domainkey.${OPS_DOMAIN}" "send.${OPS_DOMAIN}"; do
  dkim="$(ops_dns_txt "$dkim_host" | grep -i 'v=DKIM1' || true)"
  if [[ -n "$dkim" ]]; then
    ops_ok "DKIM TXT at ${dkim_host}"
  fi
done

ops_skip "Resend API domain status — run ./scripts/ops/verify-resend-domain.sh when RESEND_API_KEY is set"

ops_finish "verify-email-dns"
