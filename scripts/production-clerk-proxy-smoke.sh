#!/usr/bin/env bash
# Verify production loads Clerk JS same-origin (not broken clerk.*.vercel.app cross-origin).
# Usage: ./scripts/production-clerk-proxy-smoke.sh [base-url]
set -euo pipefail

BASE_URL="${1:-${PRODUCTION_URL:-https://visual-era.vercel.app}}"
BASE_URL="${BASE_URL%/}"

echo "Checking Clerk script setup on ${BASE_URL}/sign-in ..."
html="$(curl -fsSL --max-time 30 "${BASE_URL}/sign-in")"

if echo "$html" | grep -q 'clerk\.visual-era\.vercel\.app'; then
  echo "FAIL: Clerk JS loads from clerk.visual-era.vercel.app (cross-origin / DNS — causes CORS)."
  exit 1
fi

if ! echo "$html" | grep -qE 'src="/__clerk/npm/@clerk/clerk-js'; then
  echo "FAIL: expected same-origin /__clerk/npm/@clerk/clerk-js script src."
  exit 1
fi

echo "OK: Clerk loads same-origin via /__clerk on ${BASE_URL}/sign-in"
