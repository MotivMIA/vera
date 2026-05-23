#!/usr/bin/env bash
# Open a PR from the current agent branch to main and enable GitHub auto-merge.
# Usage: ./scripts/open-agent-pr.sh "Short title" [--fast] [--wait] [--draft]
#
# Defaults (fast):
#   --fast          Skip verbose pre-PR status; do not block on merge (exit after auto-merge on)
#   MERGE_WAIT_TIMEOUT=0
#
# Optional:
#   --wait          Poll up to 120s for merge and sync main if it completes
#   MERGE_WAIT_TIMEOUT=300  Custom wait
#   MERGE_WAIT_FOR_SYNC=1   Sync main after merge (only when --wait / timeout > 0)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"
TITLE=""
DRAFT=""
FAST=1
MERGE_WAIT_TIMEOUT="${MERGE_WAIT_TIMEOUT:-0}"
MERGE_POLL_INTERVAL="${MERGE_POLL_INTERVAL:-10}"
MERGE_WAIT_FOR_SYNC="${MERGE_WAIT_FOR_SYNC:-1}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --draft)
      DRAFT="--draft"
      ;;
    --fast)
      FAST=1
      ;;
    --no-fast)
      FAST=0
      ;;
    --wait)
      MERGE_WAIT_TIMEOUT=120
      ;;
    *)
      if [[ -z "$TITLE" ]]; then
        TITLE="$1"
      else
        echo "error: unexpected argument: $1" >&2
        exit 1
      fi
      ;;
  esac
  shift
done

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

assert_not_on_main
validate_agent_branch_or_exit

if [[ "$FAST" -eq 0 ]]; then
  echo "=== Pre-PR status ==="
  "$SCRIPT_DIR/agent-status.sh" --pre-pr || true
  echo ""
fi

BRANCH="$(current_branch)"
AGENT="$(agent_from_branch "$BRANCH")"

if [[ -z "$TITLE" ]]; then
  TITLE="[${AGENT}] ${BRANCH#agent-${AGENT}-}"
  TITLE="${TITLE//-/ }"
fi

if [[ ! "$TITLE" =~ ^\[ ]]; then
  TITLE="[${AGENT}] ${TITLE}"
fi

if ! git -C "$AGENT_GIT_ROOT" rev-parse --abbrev-ref "@{u}" >/dev/null 2>&1; then
  git -C "$AGENT_GIT_ROOT" push -u origin "$BRANCH"
else
  git -C "$AGENT_GIT_ROOT" push origin "$BRANCH"
fi

COMMIT_HASH="$(git -C "$AGENT_GIT_ROOT" rev-parse --short HEAD)"

BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT
cat >"$BODY_FILE" <<EOF
## Agent

${AGENT}

## Branch

\`${BRANCH}\`

## Task summary

<!-- Describe what this PR does -->

## Tests run

- [ ] \`./scripts/agent-quick-check.sh\` (local)
- [ ] CI on PR (build when app code changes)

## Risks

<!-- Auth, API, middleware, env, payments, etc. -->

## Rollback notes

<!-- How to revert safely -->
EOF

LINKED_ISSUE="$(agent_linked_issue_number || true)"
if [[ -n "$LINKED_ISSUE" ]]; then
  cat >>"$BODY_FILE" <<EOF

## Linked issue

https://github.com/${REPO}/issues/${LINKED_ISSUE}

Closes #${LINKED_ISSUE}
EOF
fi

CREATE_ARGS=(pr create --repo "$REPO" --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODY_FILE")
if [[ -n "$DRAFT" ]]; then
  CREATE_ARGS+=(--draft)
fi

PR_URL="$(gh "${CREATE_ARGS[@]}")"
PR_NUMBER="$(gh pr view "$PR_URL" --repo "$REPO" --json number -q .number)"

echo "PR #$PR_NUMBER — $PR_URL"

print_task_report() {
  local auto_merge="$1"
  local merge_state="$2"
  local main_synced="$3"
  local manual_step="$4"

  echo ""
  echo "=== Task report ==="
  echo "Branch:          $BRANCH"
  echo "Commit:          $COMMIT_HASH"
  echo "PR:              $PR_URL"
  echo "Auto-merge:      $auto_merge"
  echo "Merge state:     $merge_state"
  echo "Local main sync: $main_synced"
  if [[ -n "$manual_step" ]]; then
    echo "Manual step:     $manual_step"
  else
    echo "Manual step:     none"
  fi
}

if [[ -n "$DRAFT" ]]; then
  print_task_report "no (draft)" "OPEN" "not attempted" "Mark ready, enable auto-merge"
  exit 0
fi

enable_auto_merge() {
  gh pr merge "$PR_NUMBER" --repo "$REPO" --auto --squash --delete-branch
}

AUTO_MERGE_ENABLED="yes"
if ! enable_auto_merge 2>"/tmp/merge-auto-err-$$.log"; then
  if grep -q 'enablePullRequestAutoMerge' "/tmp/merge-auto-err-$$.log" 2>/dev/null \
    && gh api "repos/${REPO}" -X PATCH -f allow_auto_merge=true >/dev/null 2>&1; then
    enable_auto_merge
  else
    cat "/tmp/merge-auto-err-$$.log" >&2
    print_task_report "failed" "OPEN" "not attempted" "./scripts/merge-agent-pr.sh $PR_NUMBER"
    rm -f "/tmp/merge-auto-err-$$.log"
    exit 1
  fi
fi
rm -f "/tmp/merge-auto-err-$$.log"

echo "Auto-merge: ON (merges when CI checks pass)"

if [[ "$FAST" -eq 1 && "$MERGE_WAIT_TIMEOUT" -eq 0 ]]; then
  print_task_report "$AUTO_MERGE_ENABLED" "queued on GitHub" "pending — sync at next task start" "None — merge continues in background"
  echo "Track: gh pr checks $PR_NUMBER --repo $REPO"
  echo "Sync later: ./scripts/sync-main.sh"
  exit 0
fi

if [[ "$MERGE_WAIT_TIMEOUT" -gt 0 ]]; then
  elapsed=0
  echo "Waiting up to ${MERGE_WAIT_TIMEOUT}s for merge..."
  while [[ "$elapsed" -lt "$MERGE_WAIT_TIMEOUT" ]]; do
    state="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json state -q .state 2>/dev/null || echo "UNKNOWN")"
    if [[ "$state" == "MERGED" ]]; then
      if [[ "$MERGE_WAIT_FOR_SYNC" == "1" ]] && "$SCRIPT_DIR/sync-main.sh" --quiet; then
        print_task_report "$AUTO_MERGE_ENABLED" "MERGED" "yes ($(git -C "$AGENT_GIT_ROOT" rev-parse --short main))" ""
      else
        print_task_report "$AUTO_MERGE_ENABLED" "MERGED" "run ./scripts/sync-main.sh" "./scripts/sync-main.sh"
      fi
      exit 0
    fi
    if [[ "$state" == "CLOSED" ]]; then
      print_task_report "$AUTO_MERGE_ENABLED" "CLOSED" "not attempted" "Investigate on GitHub"
      exit 1
    fi
    sleep "$MERGE_POLL_INTERVAL"
    elapsed=$((elapsed + MERGE_POLL_INTERVAL))
  done
fi

print_task_report "$AUTO_MERGE_ENABLED" "OPEN (queued)" "pending" "None — GitHub auto-merge when CI passes"
echo "gh pr checks $PR_NUMBER --repo $REPO"
