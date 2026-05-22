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

echo "Enabling auto-merge (squash, delete branch when checks pass)..."
if gh pr merge "$PR_NUMBER" --repo "$REPO" --auto --squash --delete-branch; then
  echo ""
  echo "Auto-merge: ENABLED"
  echo "GitHub will squash-merge into main after required checks pass."
  echo "Track: gh pr view $PR_NUMBER --repo $REPO"
  echo "Checks: gh pr checks $PR_NUMBER --repo $REPO"
else
  echo ""
  echo "warning: could not enable auto-merge. Enable manually in GitHub or run:" >&2
  echo "  gh pr merge $PR_NUMBER --repo $REPO --auto --squash --delete-branch" >&2
  echo "Fallback: ./scripts/merge-agent-pr.sh $PR_NUMBER" >&2
  exit 1
fi
