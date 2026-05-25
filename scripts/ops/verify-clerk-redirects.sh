#!/usr/bin/env bash
# Read-only Clerk redirect / URL alignment checks (env names + optional Clerk API).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

EXPECTED_PATHS=(
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding/consent
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/consent
)

ops_log "Checking Clerk URL env alignment (from .env.example conventions)..."

for entry in "${EXPECTED_PATHS[@]}"; do
  key="${entry%%=*}"
  default="${entry#*=}"
  ops_ok "Expected ${key}=${default} (verify in Vercel + Clerk dashboard)"
done

if [[ -f "$ROOT/.env.local" ]]; then
  site="$(grep '^NEXT_PUBLIC_SITE_URL=' "$ROOT/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
  if [[ -n "$site" ]]; then
    ops_ok "Local NEXT_PUBLIC_SITE_URL configured (origin not printed)"
  else
    ops_warn "NEXT_PUBLIC_SITE_URL missing or empty in .env.local"
  fi
else
  ops_skip "No .env.local — production must use ${OPS_APP_URL} in Vercel (and Clerk allowed origins)"
fi

if ops_env_present CLERK_SECRET_KEY; then
  ops_require_cmd curl || true
  if command -v curl >/dev/null 2>&1; then
    code="$(curl -sS -o /tmp/clerk-instance.json -w '%{http_code}' \
      -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
      "https://api.clerk.com/v1/instance")"
    if [[ "$code" == "200" ]]; then
      ops_ok "Clerk instance API readable (metadata only; file not echoed)"
      rm -f /tmp/clerk-instance.json
    else
      ops_warn "Clerk instance API HTTP ${code} — use dev key or check restrictions"
      rm -f /tmp/clerk-instance.json
    fi
  fi
else
  ops_skip "CLERK_SECRET_KEY not set — dashboard manual check required for prod redirects"
fi

ops_log "Production: confirm allowed origins include ${OPS_APP_URL} and preview URLs in Clerk dashboard."

ops_finish "verify-clerk-redirects"
