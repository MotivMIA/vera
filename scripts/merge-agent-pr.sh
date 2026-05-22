#!/usr/bin/env bash
# Optional manual merge fallback (normal flow uses auto-merge in open-agent-pr.sh).
# Usage: ./scripts/merge-agent-pr.sh <PR_NUMBER>
# Does NOT use --admin, --force, or protection bypass.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"
MERGE_METHOD="squash merge"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

PR_NUMBER="${1:-}"
if [[ -z "$PR_NUMBER" ]]; then
  echo "Usage: $0 <PR_NUMBER>" >&2
  echo "Normal workflow: ./scripts/open-agent-pr.sh (enables auto-merge)." >&2
  exit 1
fi

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "error: PR_NUMBER must be numeric (got: $PR_NUMBER)" >&2
  exit 1
fi

if [[ ! -t 0 ]]; then
  echo "This terminal is non-interactive. Run this command in the normal Cursor terminal:" >&2
  echo "  ./scripts/merge-agent-pr.sh ${PR_NUMBER}" >&2
  exit 1
fi

AUTO="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json autoMergeRequest -q '.autoMergeRequest.enabledAt // empty' 2>/dev/null || true)"
if [[ -n "$AUTO" ]]; then
  echo "PR #$PR_NUMBER already has auto-merge enabled (enabledAt: $AUTO)."
  echo "Wait for checks or: gh pr view $PR_NUMBER --repo $REPO"
  exit 0
fi

PR_JSON="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json title,url,headRefName,mergeable,mergeStateStatus,state 2>/dev/null)" || {
  echo "error: PR #$PR_NUMBER not found in $REPO" >&2
  exit 1
}

PR_TITLE="$(echo "$PR_JSON" | jq -r '.title')"
PR_BRANCH="$(echo "$PR_JSON" | jq -r '.headRefName')"
PR_URL="$(echo "$PR_JSON" | jq -r '.url')"
PR_STATE="$(echo "$PR_JSON" | jq -r '.state')"
MERGE_STATE="$(echo "$PR_JSON" | jq -r '.mergeStateStatus')"

if [[ "$PR_STATE" != "OPEN" ]]; then
  echo "error: PR #$PR_NUMBER is not open (state: $PR_STATE)" >&2
  exit 1
fi

echo "=== Manual merge fallback ==="
echo "PR number:     #$PR_NUMBER"
echo "PR title:      $PR_TITLE"
echo "Branch:        $PR_BRANCH"
echo "URL:           $PR_URL"
echo "Merge method:  $MERGE_METHOD"
echo ""

echo "Check status:"
if ! gh pr checks "$PR_NUMBER" --repo "$REPO"; then
  echo ""
  echo "error: not all checks passed. Fix failures before merging." >&2
  exit 1
fi
echo ""

if [[ "$MERGE_STATE" != "CLEAN" && "$MERGE_STATE" != "UNSTABLE" ]]; then
  echo "error: merge blocked (mergeStateStatus: $MERGE_STATE)." >&2
  exit 1
fi

echo "Press Enter to merge manually, or Ctrl+C to cancel."
read -r

echo ""
echo "Merging PR #$PR_NUMBER ($MERGE_METHOD, delete branch)..."
gh pr merge "$PR_NUMBER" --repo "$REPO" --squash --delete-branch

echo ""
echo "Merged PR #$PR_NUMBER."
cd "$AGENT_GIT_ROOT"
git checkout main
git pull --ff-only origin main
echo "Local main is up to date."
