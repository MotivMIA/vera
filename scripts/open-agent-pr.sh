#!/usr/bin/env bash
# Open a PR from the current agent branch to main and enable GitHub auto-merge.
# Usage: ./scripts/open-agent-pr.sh "Short title" [--draft]
# Auto-merge: squash, delete branch, merges when required checks pass (no --admin).
#
# Optional env:
#   MERGE_WAIT_TIMEOUT=120   Seconds to wait for merge before exiting (default 120)
#   MERGE_POLL_INTERVAL=10   Poll interval while waiting (default 10)
#   MERGE_WAIT_FOR_SYNC=1    Run sync-main.sh after merge (default 1 if merged in time)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"
TITLE="${1:-}"
DRAFT=""
if [[ "${2:-}" == "--draft" ]]; then
  DRAFT="--draft"
fi

MERGE_WAIT_TIMEOUT="${MERGE_WAIT_TIMEOUT:-120}"
MERGE_POLL_INTERVAL="${MERGE_POLL_INTERVAL:-10}"
MERGE_WAIT_FOR_SYNC="${MERGE_WAIT_FOR_SYNC:-1}"

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

echo "=== Pre-PR status ==="
"$SCRIPT_DIR/agent-status.sh" --pre-pr || true
echo ""

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
  echo "Pushing branch to origin first..."
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

## Files changed

<!-- \`git diff --stat origin/main\` -->

## Tests run

- [ ] \`npm run lint\`
- [ ] \`npm run typecheck\`
- [ ] \`npm run build\`
- [ ] Manual / Vercel preview (if UI)

## Risks

<!-- Auth, API, middleware, env, payments, etc. -->

## Rollback notes

<!-- How to revert safely -->

## Screenshots

<!-- If UI changed, add before/after -->

## Checklist

- [ ] Work was done only on \`${BRANCH}\` (not \`main\`)
- [ ] No direct push to \`main\`
- [ ] CI checks pass (auto-merge waits for green checks)
- [ ] Auto-merge enabled (squash, delete branch)
- [ ] No secrets in diff
EOF

CREATE_ARGS=(pr create --repo "$REPO" --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODY_FILE")
if [[ -n "$DRAFT" ]]; then
  CREATE_ARGS+=(--draft)
fi

PR_URL="$(gh "${CREATE_ARGS[@]}")"
PR_NUMBER="$(gh pr view "$PR_URL" --repo "$REPO" --json number -q .number)"

echo ""
echo "PR opened: #$PR_NUMBER"
echo "URL:       $PR_URL"
echo ""

print_task_report() {
  local auto_merge="$1"
  local merge_state="$2"
  local main_synced="$3"
  local manual_step="$4"

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
  echo ""
}

report_pr_checks() {
  echo "=== PR checks (required for auto-merge) ==="
  if ! gh pr checks "$PR_NUMBER" --repo "$REPO" 2>/dev/null; then
    echo "(checks not started yet — GitHub is queuing workflows)"
  fi
  echo ""
  echo "Typical required: CI checks, Agent branch naming"
  echo "Optional / async: Vercel preview, PR summary comment"
  echo "Track: gh pr checks $PR_NUMBER --repo $REPO"
  echo ""
}

if [[ -n "$DRAFT" ]]; then
  print_task_report "no (draft PR)" "OPEN" "not attempted" "Mark PR ready, then re-run merge or open-agent-pr flow"
  echo "Draft PR — auto-merge not enabled. Mark ready, then run:"
  echo "  gh pr merge $PR_NUMBER --repo $REPO --auto --squash --delete-branch"
  exit 0
fi

enable_auto_merge() {
  gh pr merge "$PR_NUMBER" --repo "$REPO" --auto --squash --delete-branch
}

echo "Enabling auto-merge (squash, delete branch when checks pass)..."
AUTO_MERGE_ENABLED="yes"
if enable_auto_merge 2>"/tmp/merge-auto-err-$$.log"; then
  :
elif grep -q 'enablePullRequestAutoMerge' "/tmp/merge-auto-err-$$.log" 2>/dev/null; then
  echo "Enabling allow_auto_merge on repository (one-time, requires admin)..."
  if gh api "repos/${REPO}" -X PATCH -f allow_auto_merge=true >/dev/null 2>&1; then
    enable_auto_merge
  else
    cat "/tmp/merge-auto-err-$$.log" >&2
    AUTO_MERGE_ENABLED="failed"
    print_task_report "$AUTO_MERGE_ENABLED" "OPEN" "not attempted" "Enable auto-merge in GitHub → Settings → General"
    exit 1
  fi
else
  cat "/tmp/merge-auto-err-$$.log" >&2
  AUTO_MERGE_ENABLED="failed"
  print_task_report "$AUTO_MERGE_ENABLED" "OPEN" "not attempted" "./scripts/merge-agent-pr.sh $PR_NUMBER"
  rm -f "/tmp/merge-auto-err-$$.log"
  exit 1
fi
rm -f "/tmp/merge-auto-err-$$.log"

echo "Auto-merge: ENABLED — GitHub merges when required checks pass."
report_pr_checks

wait_for_merge_and_sync() {
  local elapsed=0
  local state
  local auto_merge_state

  echo "Waiting up to ${MERGE_WAIT_TIMEOUT}s for merge (poll every ${MERGE_POLL_INTERVAL}s)..."
  while [[ "$elapsed" -lt "$MERGE_WAIT_TIMEOUT" ]]; do
    state="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json state -q .state 2>/dev/null || echo "UNKNOWN")"
    auto_merge_state="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json autoMergeRequest -q '.autoMergeRequest.enabledAt // empty' 2>/dev/null || true)"

    if [[ "$state" == "MERGED" ]]; then
      echo "PR #$PR_NUMBER merged."
      if [[ "$MERGE_WAIT_FOR_SYNC" == "1" ]]; then
        if "$SCRIPT_DIR/sync-main.sh"; then
          print_task_report "$AUTO_MERGE_ENABLED" "MERGED" "yes ($(git -C "$AGENT_GIT_ROOT" rev-parse --short main 2>/dev/null || echo synced))" ""
          return 0
        fi
        print_task_report "$AUTO_MERGE_ENABLED" "MERGED" "failed — run ./scripts/sync-main.sh" "./scripts/sync-main.sh"
        return 0
      fi
      print_task_report "$AUTO_MERGE_ENABLED" "MERGED" "skipped (MERGE_WAIT_FOR_SYNC=0)" ""
      return 0
    fi

    if [[ "$state" == "CLOSED" ]]; then
      print_task_report "$AUTO_MERGE_ENABLED" "CLOSED" "not attempted" "PR closed without merge — investigate on GitHub"
      return 1
    fi

    sleep "$MERGE_POLL_INTERVAL"
    elapsed=$((elapsed + MERGE_POLL_INTERVAL))
  done

  echo ""
  echo "Checks still running or merge not finished yet."
  report_pr_checks
  print_task_report "$AUTO_MERGE_ENABLED" "OPEN (auto-merge queued)" "pending — run ./scripts/sync-main.sh after merge" "None required — GitHub will auto-merge when CI checks pass"
  echo "Auto-merge will complete on GitHub when required checks pass."
  echo "Sync local main later: ./scripts/sync-main.sh"
  return 0
}

wait_for_merge_and_sync || true
