#!/usr/bin/env bash
# Verify required keys exist in .env (prints names only, never values).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing ${ENV_FILE} — run: cp .env.example .env" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

required=(
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  DIDIT_API_KEY
  DIDIT_WORKFLOW_ID
  DIDIT_WEBHOOK_SECRET
  NEXT_PUBLIC_SITE_URL
)

optional=(
  CLERK_WEBHOOK_SIGNING_SECRET
  ALLOW_DEV_AUTH_BYPASS
  AUDIT_ENCRYPTION_KEY
)

missing=()
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing+=("$key")
  fi
done

optional_missing=()
for key in "${optional[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    optional_missing+=("$key")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "error: missing required keys in .env:" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi

echo "ok: required keys present in .env"

if [[ ${#optional_missing[@]} -gt 0 ]]; then
  echo "note: optional keys empty (ok until you need them):"
  printf '  - %s\n' "${optional_missing[@]}"
fi

site="${NEXT_PUBLIC_SITE_URL:-}"
if [[ "$site" != "http://localhost:3001" && "$site" != "http://127.0.0.1:3001" ]]; then
  echo "note: NEXT_PUBLIC_SITE_URL=${site} — default dev server is http://localhost:3001"
fi

pk="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}"
proxy="${NEXT_PUBLIC_CLERK_PROXY_URL:-}"
if [[ "$pk" == pk_test_* && -n "$proxy" && "${NEXT_PUBLIC_CLERK_FORCE_PROXY:-}" != "true" ]]; then
  echo "warn: pk_test_ with NEXT_PUBLIC_CLERK_PROXY_URL set — dev instances do not support proxy." >&2
  echo "      Remove NEXT_PUBLIC_CLERK_PROXY_URL from .env (see docs/ops/CLERK_PROXY_SETUP.md)." >&2
fi

if [[ "$pk" == pk_live_* && ( "$site" == "http://localhost:3001" || "$site" == "http://127.0.0.1:3001" ) ]]; then
  echo "warn: pk_live_ with local NEXT_PUBLIC_SITE_URL — sign-in will not work locally." >&2
  echo "      Use pk_test_/sk_test_ in .env for local dev, or test on https://visual-era.com." >&2
  echo "      See docs/ops/CLERK_PROXY_SETUP.md" >&2
fi
