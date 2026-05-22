#!/usr/bin/env bash
# Create and switch to an agent feature branch from latest main.
# Usage: ./scripts/agent-branch.sh cursor didit-vercel-fix
#   → branch agent-cursor-didit-vercel-fix
set -euo pipefail

AGENT="${1:-}"
FEATURE="${2:-}"

if [[ -z "$AGENT" || -z "$FEATURE" ]]; then
  echo "Usage: $0 <agent-name> <feature-slug>" >&2
  echo "Example: $0 cursor didit-vercel-fix" >&2
  exit 1
fi

FEATURE_SLUG="$(echo "$FEATURE" | tr '[:upper:]' '[:lower:]' | tr ' _' '-')"
BRANCH="agent-${AGENT}-${FEATURE_SLUG}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

"$SCRIPT_DIR/sync-main.sh"
git checkout -b "$BRANCH"

echo "On branch: $BRANCH"
echo "Commit with: [${AGENT}] <description>"
echo "Push with:   git push -u origin $BRANCH"
echo "Status:      ./scripts/agent-status.sh"
echo "Open PR:     ./scripts/open-agent-pr.sh \"[${AGENT}] <description>\""
