#!/usr/bin/env bash
# Rename .env.dev / .env.prod to Next.js-native .env.local / .env.production.local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
moved=0

if [[ -f "${ROOT}/.env.dev" ]]; then
  if [[ -f "${ROOT}/.env.local" ]]; then
    backup="${ROOT}/.env.local.bak"
    cp "${ROOT}/.env.local" "$backup"
    echo "backed up existing .env.local → .env.local.bak"
  fi
  mv "${ROOT}/.env.dev" "${ROOT}/.env.local"
  echo "renamed .env.dev → .env.local"
  moved=1
fi

if [[ -f "${ROOT}/.env.prod" && ! -f "${ROOT}/.env.production.local" ]]; then
  mv "${ROOT}/.env.prod" "${ROOT}/.env.production.local"
  echo "renamed .env.prod → .env.production.local"
  moved=1
fi

if [[ "$moved" -eq 0 ]]; then
  echo "nothing to migrate (already using .env.local or no .env.dev/.env.prod)"
else
  echo "done — use npm run dev (Next.js loads .env.local automatically)"
fi
