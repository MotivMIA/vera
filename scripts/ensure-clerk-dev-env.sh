#!/usr/bin/env bash
# Ensure .env.local has Clerk *_DEV slots (for pk_test_ local sign-in).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${ROOT}/.env.local"

if [[ ! -f "$FILE" ]]; then
  echo "error: missing .env.local — run: cp .env.local.example .env.local" >&2
  exit 1
fi

added=0

append_if_missing() {
  local key="$1"
  if ! grep -q "^${key}=" "$FILE" 2>/dev/null; then
    echo "${key}=" >> "$FILE"
    echo "added ${key}= to .env.local"
    added=1
  fi
}

append_if_missing "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV"
append_if_missing "CLERK_SECRET_KEY_DEV"

if [[ "$added" -eq 0 ]]; then
  echo "ok: *_DEV keys already present in .env.local"
else
  echo ""
  echo "Paste pk_test_ / sk_test_ from Clerk → Development → API Keys:"
  echo "  https://dashboard.clerk.com/last-active?path=api-keys"
  echo "Then: rm -rf .next && npm run dev"
fi
