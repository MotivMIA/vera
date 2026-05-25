#!/usr/bin/env bash
# Run all Phase 2 read-only verification scripts (safe without API tokens).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

scripts=(
  verify-github-repo-health.sh
  verify-cloudflare-dns.sh
  verify-email-dns.sh
  verify-vercel-env.sh
  verify-resend-domain.sh
  verify-clerk-redirects.sh
)

failed=0
for s in "${scripts[@]}"; do
  path="scripts/ops/${s}"
  echo ""
  echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  echo "Running ${path}"
  echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  if bash "$path"; then
    :
  else
    failed=$((failed + 1))
  fi
done

echo ""
if [[ "$failed" -gt 0 ]]; then
  echo "Phase 2 verify: ${failed} script(s) reported failures (see FAIL lines above)."
  exit 1
fi
echo "Phase 2 verify: all scripts completed (skips are OK when tokens unset)."
exit 0
