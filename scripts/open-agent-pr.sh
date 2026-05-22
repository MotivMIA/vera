#!/usr/bin/env bash
# Open a PR from the current agent branch to main and enable GitHub auto-merge.
# Usage: ./scripts/open-agent-pr.sh "Short title" [--draft]
# Auto-merge: squash, delete branch, merges when required checks pass (no --admin).
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

PR_URL="$(gh "${CREATE_ARGS[@]}" )"
PR_NUMBER="$(gh pr view "$PR_URL" --repo "$REPO" --json number -q .number)"

echo ""
echo "PR opened: #$PR_NUMBER"
echo "URL:       $PR_URL"
echo ""

if [[ -n "$DRAFT" ]]; then
  echo "Draft PR — auto-merge not enabled. Mark ready, then run:"
  echo "  gh pr merge $PR_NUMBER --repo $REPO --auto --squash --delete-branch"
  exit 0
fi

enable_auto_merge() {
  gh pr merge "$PR_NUMBER" --repo "$REPO" --auto --squash --delete-branch
}

echo "Enabling auto-merge (squash, delete branch when checks pass)..."
if enable_auto_merge 2>"/tmp/merge-auto-err-$$.log"; then
  :
elif grep -q 'enablePullRequestAutoMerge' "/tmp/merge-auto-err-$$.log" 2>/dev/null; then
  echo "Enabling allow_auto_merge on repository (one-time, requires admin)..."
  if gh api "repos/${REPO}" -X PATCH -f allow_auto_merge=true >/dev/null 2>&1; then
    enable_auto_merge
  else
    cat "/tmp/merge-auto-err-$$.log" >&2
    echo "error: enable auto-merge in GitHub → Settings → General → Allow auto-merge" >&2
    exit 1
  fi
else
  cat "/tmp/merge-auto-err-$$.log" >&2
  echo "Fallback: ./scripts/merge-agent-pr.sh $PR_NUMBER" >&2
  rm -f "/tmp/merge-auto-err-$$.log"
  exit 1
fi
rm -f "/tmp/merge-auto-err-$$.log"

echo ""
echo "Auto-merge: ENABLED"
echo "GitHub will squash-merge into main after required checks pass."
echo "Local main will sync automatically after merge (or run ./scripts/sync-main.sh)."
echo "Track: gh pr view $PR_NUMBER --repo $REPO"
echo "Checks: gh pr checks $PR_NUMBER --repo $REPO"
echo ""

wait_for_merge_and_sync() {
  local timeout_secs="${MERGE_WAIT_TIMEOUT:-600}"
  local interval_secs="${MERGE_POLL_INTERVAL:-15}"
  local elapsed=0
  local state

  echo "Waiting for PR #$PR_NUMBER to merge (timeout ${timeout_secs}s)..."
  while [[ "$elapsed" -lt "$timeout_secs" ]]; do
    state="$(gh pr view "$PR_NUMBER" --repo "$REPO" --json state -q .state 2>/dev/null || echo "UNKNOWN")"
    if [[ "$state" == "MERGED" ]]; then
      echo "PR #$PR_NUMBER merged."
      if "$SCRIPT_DIR/sync-main.sh"; then
        echo "Local main synced."
      else
        echo "warning: merge completed but sync-main failed. Run: ./scripts/sync-main.sh" >&2
      fi
      return 0
    fi
    if [[ "$state" == "CLOSED" ]]; then
      echo "PR #$PR_NUMBER closed without merge. Sync skipped." >&2
      return 1
    fi
    sleep "$interval_secs"
    elapsed=$((elapsed + interval_secs))
  done

  echo ""
  echo "Auto-merge is pending. Later, run ./scripts/sync-main.sh or ask Cursor to sync main."
  return 0
}

wait_for_merge_and_sync || true
