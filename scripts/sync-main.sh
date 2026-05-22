#!/usr/bin/env bash
# Sync local main with origin (safe: no force, no hard reset).
# Usage: ./scripts/sync-main.sh [--quiet]
set -euo pipefail

QUIET=0
if [[ "${1:-}" == "--quiet" ]]; then
  QUIET=1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: uncommitted changes would be at risk. Commit, stash, or discard first:" >&2
  git status --short >&2
  exit 1
fi

log() {
  if [[ "$QUIET" -eq 0 ]]; then
    echo "$@"
  fi
}

log "Fetching origin..."
if [[ "$QUIET" -eq 1 ]]; then
  git fetch origin main --quiet 2>/dev/null || git fetch origin --quiet
else
  git fetch origin
fi

CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT" != "main" ]]; then
  log "Checking out main (was on $CURRENT)..."
  git checkout main --quiet 2>/dev/null || git checkout main
fi

log "Pulling main (ff-only)..."
git pull --ff-only origin main --quiet 2>/dev/null || git pull --ff-only origin main

if [[ "$QUIET" -eq 0 ]]; then
  git fetch origin --prune
fi

HASH="$(git rev-parse --short HEAD)"
if [[ "$QUIET" -eq 0 ]]; then
  echo ""
  echo "main @ $HASH"
  git log -1 --oneline
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree: dirty (unexpected after sync)" >&2
  git status --short >&2
  exit 1
fi

if [[ "$QUIET" -eq 0 ]]; then
  echo "Working tree: clean"
fi
