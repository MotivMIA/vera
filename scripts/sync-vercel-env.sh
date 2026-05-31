#!/usr/bin/env bash
# Push missing keys from .env to Vercel (Production + Preview). Never prints secret values.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing .env — copy from .env.example" >&2
  exit 1
fi

if ! vercel whoami &>/dev/null; then
  echo "error: run 'vercel login' first" >&2
  exit 1
fi

cd "$ROOT"
if [[ ! -f .vercel/project.json ]]; then
  echo "Linking project…"
  vercel link --yes --project visual-era
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

existing="$(vercel env ls 2>/dev/null | awk '{print $1}' | grep -v '^name$' || true)"

add_if_missing() {
  local key="$1"
  local value="$2"
  local envs=("${@:3}")

  if [[ -z "$value" ]]; then
    echo "skip $key (empty in .env)"
    return 0
  fi

  if echo "$existing" | grep -qx "$key"; then
    echo "ok   $key (already on Vercel)"
    return 0
  fi

  for target in "${envs[@]}"; do
    echo "add  $key → $target"
    if [[ "$target" == "preview" ]]; then
      # Preview may require branch selection in the dashboard; production is enough for most keys.
      if ! vercel env add "$key" preview --value "$value" --yes --non-interactive 2>/dev/null; then
        echo "warn $key preview: add in Vercel dashboard (Preview → all branches) if needed"
      fi
    else
      vercel env add "$key" "$target" --value "$value" --yes --non-interactive
    fi
  done
}

# Production site URL override (never use localhost on Vercel)
prod_site_url="https://visual-era.com"

for key in \
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  CLERK_SECRET_KEY \
  CLERK_WEBHOOK_SIGNING_SECRET \
  NEXT_PUBLIC_CLERK_SIGN_IN_URL \
  NEXT_PUBLIC_CLERK_SIGN_UP_URL \
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL \
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL \
  NEXT_PUBLIC_SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_ANON_KEY \
  SUPABASE_SERVICE_ROLE_KEY \
  DIDIT_API_KEY \
  DIDIT_WORKFLOW_ID \
  DIDIT_WEBHOOK_SECRET \
  DIDIT_WEBHOOK_SECRET_PREVIOUS \
  NEXT_PUBLIC_DIDIT_SDK_URL \
  AUDIT_ENCRYPTION_KEY; do
  val="${!key:-}"
  add_if_missing "$key" "$val" production preview
done

# SITE_URL: ensure production/preview use canonical domain (not localhost)
if echo "$existing" | grep -qx "NEXT_PUBLIC_SITE_URL"; then
  echo "ok   NEXT_PUBLIC_SITE_URL (already on Vercel — update in dashboard if prod should be https://visual-era.com)"
else
  echo "add  NEXT_PUBLIC_SITE_URL → production preview"
  printf '%s' "$prod_site_url" | vercel env add NEXT_PUBLIC_SITE_URL production preview
fi

# Dev-only — never add to production/preview
if [[ -n "${ALLOW_DEV_AUTH_BYPASS:-}" ]]; then
  echo "note: ALLOW_DEV_AUTH_BYPASS stays local-only (not pushed to Vercel)"
fi

echo "done: sync-vercel-env"
