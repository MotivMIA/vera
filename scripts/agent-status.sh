#!/usr/bin/env bash
# Show current agent branch status and safety checks.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

cd "$AGENT_GIT_ROOT"

BRANCH="$(current_branch)"
AGENT="$(agent_from_branch "$BRANCH")"

echo "=== Agent status ==="
echo "Branch:     $BRANCH"
echo "Agent:      $AGENT"
echo ""

if is_protected_branch "$BRANCH"; then
  echo "⚠️  On protected branch — do not commit here. Run:"
  echo "    ./scripts/start-agent-task.sh cursor <feature>"
  echo ""
elif is_system_branch "$BRANCH"; then
  echo "ℹ️  System/automation branch (naming rules skipped)"
  echo ""
elif is_valid_agent_branch "$BRANCH"; then
  echo "✓  Branch name matches agent-* convention"
  echo ""
else
  echo "✗  Branch name invalid — use agent-<cursor|codex|name>-<feature>"
  echo ""
fi

if git status --porcelain | grep -q .; then
  echo "Uncommitted changes:"
  git status --short
else
  echo "Working tree: clean"
fi
echo ""

if git rev-parse --abbrev-ref "@{u}" >/dev/null 2>&1; then
  git rev-list --left-right --count "@{u}...HEAD" 2>/dev/null | while read -r behind ahead; do
    echo "vs upstream: ${ahead} ahead, ${behind} behind"
  done
else
  echo "No upstream set. Push with: git push -u origin $BRANCH"
fi
echo ""

echo "Recent commits (this branch vs main):"
git log --oneline origin/main..HEAD 2>/dev/null | head -8 || git log --oneline -5
echo ""

if command -v gh >/dev/null 2>&1; then
  PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
  if [[ -n "$PR_URL" ]]; then
    echo "Open PR: $PR_URL"
    gh pr checks 2>/dev/null | head -10 || true
  else
    echo "No PR for this branch. Open with:"
    echo "  ./scripts/open-agent-pr.sh \"[${AGENT}] summary\""
  fi
fi
