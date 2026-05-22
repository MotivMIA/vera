#!/usr/bin/env bash
# Set Vercel Deployment Protection so production is public (preview stays protected).
# Requires: vercel CLI logged in (motivmia) with access to MotivMIA/vera project.
# Does not store secrets in the repo.
set -euo pipefail

PROJECT="${VERCEL_PROJECT:-visual-era}"
TEAM_ID="${VERCEL_TEAM_ID:-team_WcP6gmysWEzFKMPdpsWJwlwx}"
# preview = only preview deployments require Vercel login; production URLs stay public
DEPLOYMENT_TYPE="${VERCEL_SSO_DEPLOYMENT_TYPE:-preview}"

AUTH_FILE="${HOME}/Library/Application Support/com.vercel.cli/auth.json"
if [[ ! -f "$AUTH_FILE" ]]; then
  echo "error: run 'vercel login' first (auth file not found)" >&2
  exit 1
fi

TOKEN="$(python3 -c "import json; print(json.load(open('$AUTH_FILE'))['token'])")"

echo "Updating Deployment Protection for ${PROJECT} (team ${TEAM_ID})..."
echo "ssoProtection.deploymentType = ${DEPLOYMENT_TYPE}"
echo ""

curl -sS -X PATCH "https://api.vercel.com/v9/projects/${PROJECT}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"ssoProtection\":{\"deploymentType\":\"${DEPLOYMENT_TYPE}\"}}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK:', d.get('name'), 'ssoProtection=', d.get('ssoProtection'))"

echo ""
echo "Public production URL: https://visual-era.vercel.app"
echo "Preview deployment URLs remain protected (401 without login)."
