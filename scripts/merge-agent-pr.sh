#!/usr/bin/env bash
# Merge the open PR for the current agent branch (or PR number) after human types MERGE.
# Usage: ./scripts/merge-agent-pr.sh [pr-number]
# Does NOT use --admin. Does NOT bypass branch protection.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

PR_ARG="${1:-}"
BRANCH="$(current_branch)"

if [[ -n "$PR_ARG" ]]; then
  PR_NUMBER="$PR_ARG"
else
  if [[ -z "$BRANCH" || "$BRANCH" == "HEAD" ]]; then
    echo "error: could not detect branch. Pass PR number: $0 <pr-number>" >&2
    exit 1
  fi
  PR_NUMBER="$(gh pr list --repo "$REPO" --head "$BRANCH" --base main --json number -q '.[0].number' 2>/dev/null || true)"
  if [[ -z "$PR_NUMBER" ]]; then
    echo "error: no open PR found for branch '$BRANCH' → main" >&2
    exit 1
  fi
fi

echo "=== Merge agent PR ==="
echo "Repo:   $REPO"
echo "PR:     #$PR_NUMBER"
echo ""

PR_JSON="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json title,url,headRefName,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup)"
echo "$PR_JSON" | jq -r '"Title:  \(.title)\nBranch: \(.headRefName)\nURL:    \(.url)\nState:  mergeable=\(.mergeable) mergeState=\(.mergeStateStatus) reviews=\(.reviewDecision)"'
echo ""

echo "Status checks:"
if ! gh pr checks "$PR_NUMBER" --repo "$REPO"; then
  echo ""
  echo "error: not all checks passed. Fix failures before merging." >&2
  exit 1
fi
echo ""

MERGE_STATE="$(echo "$PR_JSON" | jq -r '.mergeStateStatus')"
if [[ "$MERGE_STATE" != "CLEAN" && "$MERGE_STATE" != "UNSTABLE" ]]; then
  echo "warning: mergeStateStatus is '$MERGE_STATE' (expected CLEAN or UNSTABLE)." >&2
  echo "Common blockers: unresolved review threads, missing approvals, branch behind main." >&2
  echo ""
fi

echo "This will merge PR #$PR_NUMBER into main using:"
echo "  gh pr merge --squash --delete-branch"
echo "(no --admin, no protection bypass)"
echo ""
echo "Type MERGE to confirm (anything else aborts):"
read -r CONFIRM

if [[ "$CONFIRM" != "MERGE" ]]; then
  echo "Aborted (confirmation was not MERGE)."
  exit 1
fi

echo ""
echo "Merging..."
gh pr merge "$PR_NUMBER" --repo "$REPO" --squash --delete-branch

echo ""
echo "Merged PR #$PR_NUMBER."
echo "Sync local main: git checkout main && git pull origin main"
