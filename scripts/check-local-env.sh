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

is_clerk_dev_context() {
  case "${NEXT_PUBLIC_SITE_URL:-http://localhost:3001}" in
    http://localhost:*|http://127.0.0.1:*|http://\[::1\]:*) return 0 ;;
  esac
  return 1
}

resolve_clerk_publishable_key() {
  local dev="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV:-}"
  local prod="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD:-}"
  local legacy="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}"

  if [[ -n "$dev" || -n "$prod" ]]; then
    if is_clerk_dev_context; then
      echo "$dev"
    else
      echo "$prod"
    fi
    return
  fi

  echo "$legacy"
}

resolve_clerk_secret_key() {
  local dev="${CLERK_SECRET_KEY_DEV:-}"
  local prod="${CLERK_SECRET_KEY_PROD:-}"
  local legacy="${CLERK_SECRET_KEY:-}"

  if [[ -n "$dev" || -n "$prod" ]]; then
    if is_clerk_dev_context; then
      echo "$dev"
    else
      echo "$prod"
    fi
    return
  fi

  echo "$legacy"
}

has_dual_clerk_keys=false
if [[ -n "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV:-}" || -n "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD:-}" || -n "${CLERK_SECRET_KEY_DEV:-}" || -n "${CLERK_SECRET_KEY_PROD:-}" ]]; then
  has_dual_clerk_keys=true
fi

required=(
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

resolved_pk="$(resolve_clerk_publishable_key)"
resolved_sk="$(resolve_clerk_secret_key)"

if [[ -z "$resolved_pk" ]]; then
  if [[ "$has_dual_clerk_keys" == true ]]; then
    missing+=("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV (local dev)")
  else
    missing+=("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
  fi
fi

if [[ -z "$resolved_sk" ]]; then
  if [[ "$has_dual_clerk_keys" == true ]]; then
    missing+=("CLERK_SECRET_KEY_DEV (local dev)")
  else
    missing+=("CLERK_SECRET_KEY")
  fi
fi

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

if [[ "$has_dual_clerk_keys" == true ]]; then
  echo "note: dual Clerk keys configured — npm run dev uses *_DEV, production build uses *_PROD"
fi

if [[ ${#optional_missing[@]} -gt 0 ]]; then
  echo "note: optional keys empty (ok until you need them):"
  printf '  - %s\n' "${optional_missing[@]}"
fi

site="${NEXT_PUBLIC_SITE_URL:-}"
if [[ "$site" != "http://localhost:3001" && "$site" != "http://127.0.0.1:3001" ]]; then
  echo "note: NEXT_PUBLIC_SITE_URL=${site} — default dev server is http://localhost:3001"
fi

pk="$resolved_pk"
proxy="${NEXT_PUBLIC_CLERK_PROXY_URL:-}"
if [[ "$pk" == pk_test_* && -n "$proxy" && "${NEXT_PUBLIC_CLERK_FORCE_PROXY:-}" != "true" ]]; then
  echo "warn: pk_test_ with NEXT_PUBLIC_CLERK_PROXY_URL set — dev instances do not support proxy." >&2
  echo "      Remove NEXT_PUBLIC_CLERK_PROXY_URL from .env (see docs/ops/CLERK_PROXY_SETUP.md)." >&2
fi

if [[ "$pk" == pk_live_* && ( "$site" == "http://localhost:3001" || "$site" == "http://127.0.0.1:3001" ) ]]; then
  echo "warn: pk_live_ active in local dev — sign-in will not work on localhost." >&2
  if [[ "$has_dual_clerk_keys" == true ]]; then
    echo "      Add pk_test_/sk_test_ to NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV / CLERK_SECRET_KEY_DEV." >&2
  else
    echo "      Use dual *_DEV/*_PROD keys in .env, or set pk_test_/sk_test_ for local dev." >&2
    echo "      See docs/ops/LOCAL_ENV.md and docs/ops/CLERK_PROXY_SETUP.md" >&2
  fi
fi
