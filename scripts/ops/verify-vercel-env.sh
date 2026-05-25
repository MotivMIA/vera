#!/usr/bin/env bash
# Verify required env key *names* exist locally / in Vercel (never prints values).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

REQUIRED_KEYS=(
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
)

ops_log "Checking required production env key names (values redacted)..."

check_file_keys() {
  local label="$1"
  local file="$2"
  [[ -f "$file" ]] || return 0
  local missing=()
  for key in "${REQUIRED_KEYS[@]}"; do
    if ! grep -q "^${key}=" "$file" 2>/dev/null; then
      missing+=("$key")
      continue
    fi
    local val
    val="$(grep "^${key}=" "$file" | head -1 | cut -d= -f2- | tr -d ' "'\''')"
    if [[ -z "$val" ]]; then
      ops_warn "${label}: ${key} is set but empty"
    else
      ops_ok "${label}: ${key} present (non-empty)"
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    ops_warn "${label}: missing keys: ${missing[*]}"
  fi
}

check_file_keys ".env.local" "$ROOT/.env.local"
check_file_keys ".env" "$ROOT/.env"

if ops_env_present VERCEL_TOKEN; then
  if command -v vercel >/dev/null 2>&1; then
    ops_log "Vercel CLI: listing env keys for linked project (names only)..."
    if vercel env ls production 2>/dev/null | head -20; then
      ops_ok "vercel env ls succeeded (review output above for key names)"
    else
      ops_warn "vercel env ls failed — link project or check VERCEL_TOKEN"
    fi
  else
    ops_skip "VERCEL_TOKEN set but vercel CLI not installed"
  fi
else
  ops_skip "VERCEL_TOKEN not set — local file check only"
fi

ops_finish "verify-vercel-env"
