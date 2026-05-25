#!/usr/bin/env bash
# Shared helpers for read-only ops verification scripts.
# shellcheck disable=SC2034
set -euo pipefail

OPS_DOMAIN="${OPS_DOMAIN:-visual-era.com}"
OPS_APP_URL="${OPS_APP_URL:-https://visual-era.vercel.app}"

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
