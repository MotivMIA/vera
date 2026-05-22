#!/usr/bin/env bash
# Start an agent task: create agent-<name>-<feature> from latest main.
# Usage: ./scripts/start-agent-task.sh cursor multi-agent-workflow
#        ./scripts/start-agent-task.sh codex onboarding-consent
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

AGENT="${1:-}"
FEATURE="${2:-}"

if [[ -z "$AGENT" || -z "$FEATURE" ]]; then
  echo "Usage: $0 <cursor|codex|other> <feature-slug>" >&2
  echo "Example: $0 cursor multi-agent-workflow" >&2
  exit 1
fi

assert_clean_worktree_or_exit
echo "Syncing main before new branch..."
"$SCRIPT_DIR/agent-branch.sh" "$AGENT" "$FEATURE"

case "$AGENT" in
  cursor)
    echo ""
    echo "Role: Cursor supervisor — break down work, review, open PR; do not push to main."
    ;;
  codex)
    echo ""
    echo "Role: Codex worker — scoped commits with [codex]; push branch; Cursor opens PR."
    ;;
  *)
    echo ""
    echo "Role: agent-$AGENT — use [${AGENT}] commit prefix; merge via PR only."
    ;;
esac
