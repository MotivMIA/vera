#!/usr/bin/env bash
# Create or refresh the two env files: .env.local (local) and .env.production.local (live).
# Usage:
#   setup-env-files.sh           # split from .env if present, else copy templates
#   setup-env-files.sh --force   # overwrite existing local/live files from .env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${ENV_SOURCE:-${ROOT}/.env}"
FORCE=false

if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

LOCAL="${ROOT}/.env.local"
LIVE="${ROOT}/.env.production.local"

sed_inplace() {
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

apply_local_overrides() {
  local file="$1"
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "$file"; then
    sed_inplace 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:3001|' "$file"
  else
    echo "NEXT_PUBLIC_SITE_URL=http://localhost:3001" >> "$file"
  fi

  if grep -q '^ALLOW_DEV_AUTH_BYPASS=' "$file"; then
    sed_inplace 's|^ALLOW_DEV_AUTH_BYPASS=.*|ALLOW_DEV_AUTH_BYPASS=true|' "$file"
  else
    echo "ALLOW_DEV_AUTH_BYPASS=true" >> "$file"
  fi

  sed_inplace '/^NEXT_PUBLIC_CLERK_PROXY_URL=/d' "$file" 2>/dev/null || true
  sed_inplace '/^NEXT_PUBLIC_CLERK_FORCE_PROXY=/d' "$file" 2>/dev/null || true
}

apply_live_overrides() {
  local file="$1"
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "$file"; then
    sed_inplace 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://visual-era.com|' "$file"
  else
    echo "NEXT_PUBLIC_SITE_URL=https://visual-era.com" >> "$file"
  fi

  sed_inplace '/^ALLOW_DEV_AUTH_BYPASS=/d' "$file" 2>/dev/null || true
}

# Map legacy single Clerk keys into *_DEV / *_PROD slots when missing.
normalize_clerk_dual_keys() {
  local file="$1"
  local mode="$2" # local | live

  # shellcheck disable=SC1090
  set -a
  # shellcheck source=/dev/null
  source "$file"
  set +a

  local legacy_pk="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}"
  local legacy_sk="${CLERK_SECRET_KEY:-}"

  if [[ -z "$legacy_pk" && -z "$legacy_sk" ]]; then
    return 0
  fi

  if [[ "$mode" == "local" ]]; then
    if [[ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV:-}" && "$legacy_pk" == pk_test_* ]]; then
      echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV=${legacy_pk}" >> "$file"
    fi
    if [[ -z "${CLERK_SECRET_KEY_DEV:-}" && "$legacy_sk" == sk_test_* ]]; then
      echo "CLERK_SECRET_KEY_DEV=${legacy_sk}" >> "$file"
    fi
    if [[ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD:-}" && "$legacy_pk" == pk_live_* ]]; then
      echo "# Optional fallback — prefer pk_test_ in DEV for localhost sign-in" >> "$file"
      echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD=${legacy_pk}" >> "$file"
      echo "CLERK_SECRET_KEY_PROD=${legacy_sk}" >> "$file"
    fi
  else
    if [[ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD:-}" ]]; then
      echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD=${legacy_pk}" >> "$file"
    fi
    if [[ -z "${CLERK_SECRET_KEY_PROD:-}" ]]; then
      echo "CLERK_SECRET_KEY_PROD=${legacy_sk}" >> "$file"
    fi
  fi
}

split_from_source() {
  if [[ ! -f "$SOURCE" ]]; then
    echo "error: no source file at ${SOURCE}" >&2
    exit 1
  fi

  if [[ -f "$LOCAL" || -f "$LIVE" ]] && [[ "$FORCE" != true ]]; then
    echo "error: .env.local or .env.production.local already exists — use --force to overwrite from ${SOURCE}" >&2
    exit 1
  fi

  cp "$SOURCE" "$LOCAL"
  cp "$SOURCE" "$LIVE"

  apply_local_overrides "$LOCAL"
  apply_live_overrides "$LIVE"
  normalize_clerk_dual_keys "$LOCAL" "local"
  normalize_clerk_dual_keys "$LIVE" "live"

  echo "Local (dev):  ${LOCAL}"
  echo "Live (prod):  ${LIVE}"
  echo ""
  echo "  npm run dev    → .env.local"
  echo "  npm run build  → .env.production.local"
  echo ""
  echo "Add pk_test_/sk_test_ to *_DEV in .env.local for localhost Clerk sign-in."
}

init_from_templates() {
  if [[ -f "$LOCAL" || -f "$LIVE" ]] && [[ "$FORCE" != true ]]; then
    echo "error: env files already exist — use --force or run: npm run env:setup -- --force" >&2
    exit 1
  fi

  cp "${ROOT}/.env.local.example" "$LOCAL"
  cp "${ROOT}/.env.production.local.example" "$LIVE"
  echo "created empty templates — fill secrets, then npm run env:check"
}

if [[ -f "$SOURCE" ]]; then
  split_from_source
else
  init_from_templates
fi
