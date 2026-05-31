#!/usr/bin/env bash
# Smoke-check key routes on local dev server (default port 3001).
set -euo pipefail

PORT="${PORT:-3001}"
BASE="http://localhost:${PORT}"

routes=(
  /
  /sign-in
  /onboarding/consent
  /verify-identity
  /documents
  /success
)

failed=0
for path in "${routes[@]}"; do
  code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${path}" || echo "000")"
  if [[ "$code" =~ ^[23] ]]; then
    echo "ok  ${code}  ${path}"
  else
    echo "fail ${code}  ${path}"
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  echo "error: one or more routes failed — is 'npm run dev' running on port ${PORT}?" >&2
  exit 1
fi

echo "ok: dev smoke routes passed"
