#!/usr/bin/env bash
# Sync local main with origin (safe: no force, no hard reset).
# Usage: ./scripts/sync-main.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: uncommitted changes would be at risk. Commit, stash, or discard first:" >&2
  git status --short >&2
  exit 1
fi

echo "Fetching origin..."
git fetch origin

CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT" != "main" ]]; then
  echo "Checking out main (was on $CURRENT)..."
  git checkout main
fi

echo "Pulling main (ff-only)..."
git pull --ff-only origin main

echo "Pruning deleted remote branches..."
git fetch origin --prune

HASH="$(git rev-parse --short HEAD)"
echo ""
echo "main @ $HASH"
git log -1 --oneline

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree: dirty (unexpected after sync)"
  git status --short
  exit 1
else
  echo "Working tree: clean"
fi
