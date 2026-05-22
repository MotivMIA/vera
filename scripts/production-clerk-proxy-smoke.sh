#!/usr/bin/env bash
# Fail if production HTML enables the Clerk FAPI proxy at /__clerk.
# Usage: ./scripts/production-clerk-proxy-smoke.sh [base-url]
#   PRODUCTION_URL=https://visual-era.vercel.app ./scripts/production-clerk-proxy-smoke.sh
set -euo pipefail

BASE_URL="${1:-${PRODUCTION_URL:-https://visual-era.vercel.app}}"
BASE_URL="${BASE_URL%/}"

echo "Checking Clerk proxy markers on ${BASE_URL}/sign-in ..."
html="$(curl -fsSL --max-time 30 "${BASE_URL}/sign-in")"

if echo "$html" | grep -q 'data-clerk-proxy-url="/__clerk"'; then
  echo "FAIL: found data-clerk-proxy-url=\"/__clerk\""
  echo "Remove NEXT_PUBLIC_CLERK_PROXY_URL from Vercel and redeploy."
  exit 1
fi

if echo "$html" | grep -q '"proxyUrl":"/__clerk"'; then
  echo "FAIL: found \"proxyUrl\":\"/__clerk\" in ClerkProvider payload"
  echo "Remove NEXT_PUBLIC_CLERK_PROXY_URL from Vercel and redeploy."
  exit 1
fi

echo "OK: no Clerk /__clerk proxy markers on ${BASE_URL}/sign-in"
