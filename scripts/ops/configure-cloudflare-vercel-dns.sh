#!/usr/bin/env bash
# Point visual-era.com DNS at Vercel (edit existing records — avoids "CNAME already exists").
#
# Requires: CLOUDFLARE_API_TOKEN with Zone:DNS:Edit for visual-era.com
# Optional: CLOUDFLARE_ZONE_ID (auto-resolved if omitted)
#
# Usage:
#   ./scripts/ops/configure-cloudflare-vercel-dns.sh           # dry-run
#   ./scripts/ops/configure-cloudflare-vercel-dns.sh --apply   # write changes
set -uo pipefail

ZONE_NAME="${CLOUDFLARE_ZONE_NAME:-visual-era.com}"
VERCEL_APEX_IP="${VERCEL_APEX_IP:-76.76.21.21}"
WWW_CNAME_TARGET="${WWW_CNAME_TARGET:-cname.vercel-dns.com}"
APPLY=0

if [[ "${1:-}" == "--apply" ]]; then
  APPLY=1
fi

log() { printf '%s\n' "$*"; }
die() { log "ERROR: $*"; exit 1; }

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  die "Set CLOUDFLARE_API_TOKEN (Zone DNS Edit). Dry-run only works with token for listing."
fi

if ! command -v curl >/dev/null || ! command -v jq >/dev/null; then
  die "Need curl and jq"
fi

cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local args=(-sS -X "$method" -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json")
  if [[ -n "$data" ]]; then
    args+=(-d "$data")
  fi
  curl "${args[@]}" "https://api.cloudflare.com/client/v4${path}"
}

if [[ -z "${CLOUDFLARE_ZONE_ID:-}" ]]; then
  CLOUDFLARE_ZONE_ID="$(cf_api GET "/zones?name=${ZONE_NAME}" | jq -r '.result[0].id // empty')"
  [[ -n "$CLOUDFLARE_ZONE_ID" && "$CLOUDFLARE_ZONE_ID" != "null" ]] || die "Zone not found: ${ZONE_NAME}"
fi

log "Zone: ${ZONE_NAME} (${CLOUDFLARE_ZONE_ID})"
log "Target apex A: ${VERCEL_APEX_IP} (proxied=false)"
log "Target www CNAME: ${WWW_CNAME_TARGET} (proxied=false)"
log "Mode: $([[ "$APPLY" -eq 1 ]] && echo APPLY || echo DRY-RUN)"
log ""

records="$(cf_api GET "/zones/${CLOUDFLARE_ZONE_ID}/dns_records?per_page=100")"
echo "$records" | jq -e '.success' >/dev/null || die "Failed to list DNS records"

upsert_record() {
  local id="$1"
  local rtype="$2"
  local rname="$3"
  local content="$4"
  local proxied="${5:-false}"

  local body
  body="$(jq -n --arg type "$rtype" --arg name "$rname" --arg content "$content" \
    --argjson proxied "$proxied" \
    '{type: $type, name: $name, content: $content, proxied: $proxied, ttl: 1}')"

  if [[ -n "$id" ]]; then
    log "UPDATE ${rtype} ${rname} -> ${content} (proxied=${proxied}) id=${id}"
    if [[ "$APPLY" -eq 1 ]]; then
      resp="$(cf_api PATCH "/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}" "$body")"
      echo "$resp" | jq -e '.success' >/dev/null || die "PATCH failed: $(echo "$resp" | jq -c '.errors')"
    fi
  else
    log "CREATE ${rtype} ${rname} -> ${content} (proxied=${proxied})"
    if [[ "$APPLY" -eq 1 ]]; then
      resp="$(cf_api POST "/zones/${CLOUDFLARE_ZONE_ID}/dns_records" "$body")"
      echo "$resp" | jq -e '.success' >/dev/null || die "POST failed: $(echo "$resp" | jq -c '.errors')"
    fi
  fi
}

# Apex: single A record → Vercel IP (grey cloud)
apex_rows=()
while IFS= read -r row; do
  [[ -n "$row" ]] && apex_rows+=("$row")
done < <(echo "$records" | jq -c '.result[] | select(.type=="A" and (.name=="'"${ZONE_NAME}"'" or .name=="@"))')
if [[ ${#apex_rows[@]} -gt 0 ]]; then
  first_id="$(echo "${apex_rows[0]}" | jq -r '.id')"
  upsert_record "$first_id" "A" "${ZONE_NAME}" "${VERCEL_APEX_IP}" "false"
  for ((i = 1; i < ${#apex_rows[@]}; i++)); do
    extra_id="$(echo "${apex_rows[$i]}" | jq -r '.id')"
    if [[ "$APPLY" -eq 1 ]]; then
      log "DELETE extra apex A id=${extra_id}"
      cf_api DELETE "/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${extra_id}" | jq -e '.success' >/dev/null
    else
      log "WOULD DELETE extra apex A id=${extra_id}"
    fi
  done
else
  upsert_record "" "A" "${ZONE_NAME}" "${VERCEL_APEX_IP}" "false"
fi

# www: edit existing CNAME (fixes "already exists" in UI)
www_row="$(echo "$records" | jq -c '.result[] | select(.name=="www.'"${ZONE_NAME}"'" or .name=="www")' | head -1)"
if [[ -n "$www_row" ]]; then
  www_id="$(echo "$www_row" | jq -r '.id')"
  www_type="$(echo "$www_row" | jq -r '.type')"
  if [[ "$www_type" == "CNAME" ]]; then
    upsert_record "$www_id" "CNAME" "www.${ZONE_NAME}" "${WWW_CNAME_TARGET}" "false"
  else
    log "WARN: www is ${www_type}, not CNAME — converting via UPDATE to CNAME"
    if [[ "$APPLY" -eq 1 ]]; then
      cf_api DELETE "/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${www_id}" | jq -e '.success' >/dev/null
    fi
    upsert_record "" "CNAME" "www.${ZONE_NAME}" "${WWW_CNAME_TARGET}" "false"
  fi
else
  upsert_record "" "CNAME" "www.${ZONE_NAME}" "${WWW_CNAME_TARGET}" "false"
fi

log ""
if [[ "$APPLY" -eq 0 ]]; then
  log "Dry-run complete. Re-run with --apply to write changes."
else
  log "Done. Wait 1–10 min, then: ./scripts/ops/verify-custom-domain.sh"
  log "Vercel will email when visual-era.com is verified."
fi
