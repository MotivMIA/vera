#!/usr/bin/env bash
# Fail if product repo reintroduces council / external planning scaffolding.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FORBIDDEN=(
  'council-smoke-pill'
  'AI_OPS_REFERENCE'
  'create-council-brief'
  'MULTI_MODEL_COUNCIL'
  'NEXT_PUBLIC_COUNCIL_SMOKE'
)

fail=0
for pattern in "${FORBIDDEN[@]}"; do
  if matches=$(rg -l "$pattern" --glob '!node_modules/**' --glob '!.git/**' --glob '!scripts/check-repo-boundaries.sh' . 2>/dev/null || true); then
    if [[ -n "$matches" ]]; then
      echo "ERROR: forbidden pattern '$pattern' in:" >&2
      echo "$matches" >&2
      fail=1
    fi
  fi
done

if matches=$(rg -l 'ai-ops' app components lib middleware.ts package.json .github/workflows .env.example 2>/dev/null || true); then
  if [[ -n "$matches" ]]; then
    echo "ERROR: 'ai-ops' must not appear in product code paths:" >&2
    echo "$matches" >&2
    fail=1
  fi
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "OK: repo boundary check passed."
