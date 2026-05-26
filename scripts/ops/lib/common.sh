#!/usr/bin/env bash
# Shared helpers for read-only ops verification scripts.
# shellcheck disable=SC2034
set -euo pipefail

OPS_DOMAIN="${OPS_DOMAIN:-visual-era.com}"
OPS_APP_URL="${OPS_APP_URL:-https://visual-era.com}"

: "${OPS_FAIL:=0}"
: "${OPS_SKIP:=0}"
: "${OPS_OK:=0}"

ops_log() { printf '%s\n' "$*"; }
ops_ok()   { OPS_OK=$((OPS_OK + 1)); ops_log "OK   $*"; }
ops_warn() { ops_log "WARN $*"; }
ops_skip() { OPS_SKIP=$((OPS_SKIP + 1)); ops_log "SKIP $*"; }
ops_fail() { OPS_FAIL=$((OPS_FAIL + 1)); ops_log "FAIL $*"; }

ops_require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    ops_fail "required command not found: $cmd"
    return 1
  fi
}

# Resolve A/AAAA records (dig preferred; host fallback on macOS).
ops_dns_lookup() {
  local host="$1"
  local rrtype="${2:-A}"
  if command -v dig >/dev/null 2>&1; then
    dig +short "$rrtype" "$host" 2>/dev/null || true
    return 0
  fi
  if command -v host >/dev/null 2>&1; then
    host -t "$rrtype" "$host" 2>/dev/null | sed -n 's/.*address //p;s/.*has address //p' || true
    return 0
  fi
  return 1
}

ops_dns_txt() {
  local host="$1"
  if command -v dig >/dev/null 2>&1; then
    dig +short TXT "$host" 2>/dev/null || true
    return 0
  fi
  if command -v host >/dev/null 2>&1; then
    host -t TXT "$host" 2>/dev/null | sed 's/.*"//;s/".*//' || true
    return 0
  fi
  return 1
}

ops_dns_mx() {
  local host="$1"
  if command -v dig >/dev/null 2>&1; then
    dig +short MX "$host" 2>/dev/null || true
    return 0
  fi
  if command -v host >/dev/null 2>&1; then
    host -t MX "$host" 2>/dev/null | sed -n 's/.*mail is handled by //p' || true
    return 0
  fi
  return 1
}

ops_require_dns_tools() {
  if command -v dig >/dev/null 2>&1 || command -v host >/dev/null 2>&1; then
    return 0
  fi
  ops_fail "need dig or host for DNS checks"
  return 1
}

ops_env_present() {
  local name="$1"
  [[ -n "${!name:-}" ]]
}

# Export KEY from a dotenv file if not already in the environment.
ops_export_from_dotenv() {
  local key="$1"
  local file="${2:-}"
  ops_env_present "$key" && return 0
  [[ -n "$file" && -f "$file" ]] || return 1
  local val
  val="$(grep "^${key}=" "$file" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d ' "'\''"')"
  [[ -n "$val" ]] || return 1
  export "${key}=${val}"
}

# Resolve Cloudflare zone id for OPS_DOMAIN when CLOUDFLARE_API_TOKEN is set.
ops_resolve_cloudflare_zone_id() {
  if ops_env_present CLOUDFLARE_ZONE_ID; then
    return 0
  fi
  if ! ops_env_present CLOUDFLARE_API_TOKEN; then
    return 1
  fi
  ops_require_cmd curl || return 1
  ops_require_cmd jq || return 1
  local zid
  zid="$(curl -sS \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=${OPS_DOMAIN}" \
    | jq -r '.result[0].id // empty')"
  [[ -n "$zid" && "$zid" != "null" ]] || return 1
  export CLOUDFLARE_ZONE_ID="$zid"
}

# Load KEY=value names from a dotenv file (names only, no export of secrets to logs).
ops_dotenv_keys() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  grep -E '^[A-Z][A-Z0-9_]*=' "$file" | cut -d= -f1 | sort -u
}

ops_finish() {
  local script_name="${1:-verify}"
  ops_log ""
  ops_log "=== ${script_name} summary: ok=${OPS_OK} skip=${OPS_SKIP} fail=${OPS_FAIL} ==="
  if [[ "$OPS_FAIL" -gt 0 ]]; then
    return 1
  fi
  return 0
}
