#!/usr/bin/env bash
# Install local git hooks that block commit/push to main.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SRC="$ROOT/scripts/hooks"
HOOKS_DST="$ROOT/.git/hooks"

if [[ ! -d "$ROOT/.git" ]]; then
  echo "error: not a git repository" >&2
  exit 1
fi

mkdir -p "$HOOKS_DST"
for hook in pre-commit pre-push; do
  if [[ ! -f "$HOOKS_SRC/$hook" ]]; then
    echo "error: missing $HOOKS_SRC/$hook" >&2
    exit 1
  fi
  cp "$HOOKS_SRC/$hook" "$HOOKS_DST/$hook"
  chmod +x "$HOOKS_DST/$hook"
  echo "Installed $hook"
done

echo "Done. Hooks block commits and pushes to main/master."
