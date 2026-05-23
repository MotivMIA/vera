#!/usr/bin/env bash
# Ship a complete unit: push branch, open PR, enable auto-merge (no merge wait).
# Use only when the agent branch is ready — not for every small local commit.
# Iterate locally with agent-quick-check.sh; run this once per shippable unit.
# If .agent/tasks/issue-N.md or branch agent-cursor-issue-N-* exists, PR body includes Closes #N.
# Usage: ./scripts/agent-finish.sh "[cursor] short title" [--wait] [--draft]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

assert_not_on_main
validate_agent_branch_or_exit

BRANCH="$(current_branch)"
if ! git -C "$AGENT_GIT_ROOT" rev-parse --abbrev-ref "@{u}" >/dev/null 2>&1; then
  git -C "$AGENT_GIT_ROOT" push -u origin "$BRANCH"
else
  git -C "$AGENT_GIT_ROOT" push origin "$BRANCH"
fi

exec "$SCRIPT_DIR/open-agent-pr.sh" "$@" --fast
