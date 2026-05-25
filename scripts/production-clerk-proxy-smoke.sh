#!/usr/bin/env bash
# Verify production loads Clerk JS same-origin (not broken clerk.*.vercel.app cross-origin).
# Usage: ./scripts/production-clerk-proxy-smoke.sh [base-url]
set -euo pipefail

BASE_URL="${1:-${PRODUCTION_URL:-https://visual-era.com}}"
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

clerk_js_code="$(curl -fsSL --max-time 30 -o /dev/null -w "%{http_code}" "${BASE_URL}/__clerk/npm/@clerk/clerk-js@6/dist/clerk.browser.js")"
if [ "$clerk_js_code" != "200" ]; then
  echo "FAIL: /__clerk/npm clerk.browser.js returned HTTP ${clerk_js_code} (expected 200)."
  exit 1
fi

echo "OK: Clerk loads same-origin via /__clerk on ${BASE_URL}/sign-in"
