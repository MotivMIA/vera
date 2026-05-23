#!/usr/bin/env bash
# Start a Cursor task from a GitHub issue: branch + local brief file.
# Usage: ./scripts/start-ai-issue-task.sh 123
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"
# shellcheck source=lib/gh-issue.sh
source "$SCRIPT_DIR/lib/gh-issue.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"
ISSUE_NUM="${1:-}"

if [[ -z "$ISSUE_NUM" ]]; then
  echo "Usage: $0 <issue-number>" >&2
  echo "Example: $0 123" >&2
  echo "List issues: ./scripts/ai-issue-intake.sh" >&2
  exit 1
fi

if [[ ! "$ISSUE_NUM" =~ ^[0-9]+$ ]]; then
  echo "error: issue number must be numeric (got: $ISSUE_NUM)" >&2
  exit 1
fi

gh_issue_require_tools
assert_clean_worktree_or_exit

echo "Syncing main before issue branch..."
"$SCRIPT_DIR/sync-main.sh" --quiet

issue_json="$(gh_issue_fetch_json "$REPO" "$ISSUE_NUM")"

STATE="$(jq_from_issue_json "$issue_json" '.state // empty')"
if [[ -z "$STATE" || "$STATE" == "null" ]]; then
  echo "error: invalid JSON for issue #${ISSUE_NUM} (missing state)." >&2
  exit 1
fi
if [[ "$STATE" != "OPEN" ]]; then
  echo "error: issue #${ISSUE_NUM} is not open (state: ${STATE})." >&2
  exit 1
fi

TITLE="$(jq_from_issue_json "$issue_json" '.title // empty')"
BODY="$(jq_from_issue_json "$issue_json" '.body // empty')"
URL="$(jq_from_issue_json "$issue_json" '.url // empty')"
LABELS="$(jq_from_issue_json "$issue_json" '[.labels[]?.name] | join(", ")')"

if issue_has_label "$issue_json" "cursor-rejected"; then
  echo "error: issue #${ISSUE_NUM} is cursor-rejected — will not start." >&2
  echo "Run: ./scripts/ai-issue-intake.sh ${ISSUE_NUM}" >&2
  exit 1
fi

if issue_has_label "$issue_json" "cursor-deferred"; then
  echo "error: issue #${ISSUE_NUM} is cursor-deferred — will not start." >&2
  exit 1
fi

if issue_has_label "$issue_json" "grok-idea" && ! issue_has_label "$issue_json" "cursor-accepted"; then
  echo "error: grok-idea without cursor-accepted — triage first." >&2
  echo "Run: ./scripts/ai-issue-intake.sh ${ISSUE_NUM}" >&2
  echo "Add label cursor-accepted when ChatGPT/human approves." >&2
  exit 1
fi

TITLE_SLUG="$(issue_slug_from_title_and_body "$ISSUE_NUM" "$TITLE" "$BODY")"
TITLE_SLUG="${TITLE_SLUG#issue-${ISSUE_NUM}-}"
BRANCH="agent-cursor-issue-${ISSUE_NUM}-${TITLE_SLUG}"

if git -C "$AGENT_GIT_ROOT" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "error: branch $BRANCH already exists." >&2
  echo "Checkout it or delete before restarting." >&2
  exit 1
fi

git -C "$AGENT_GIT_ROOT" checkout -b "$BRANCH"

TASK_DIR="$AGENT_GIT_ROOT/.agent/tasks"
mkdir -p "$TASK_DIR"
BRIEF_FILE="$TASK_DIR/issue-${ISSUE_NUM}.md"

cat >"$BRIEF_FILE" <<EOF
# Issue #${ISSUE_NUM} — ${TITLE}

-identity: issue-${ISSUE_NUM}
github: ${URL}
closes: #${ISSUE_NUM}

## Labels

${LABELS}

## Issue body

${BODY}

---

## Cursor workflow

1. Implement acceptance criteria above (classify: run \`./scripts/ai-issue-intake.sh ${ISSUE_NUM}\`).
2. \`./scripts/agent-quick-check.sh\`
3. Commit: \`[cursor] …\`
4. \`./scripts/agent-finish.sh "[cursor] ${TITLE}"\` — PR will include \`Closes #${ISSUE_NUM}\`

Do not bypass branch protection or CI.
EOF

git -C "$AGENT_GIT_ROOT" add "$BRIEF_FILE"
git -C "$AGENT_GIT_ROOT" commit -m "[cursor] start task from issue #${ISSUE_NUM}"

echo ""
echo "=== Issue task started ==="
echo "Issue:   #${ISSUE_NUM} — $TITLE"
echo "URL:     $URL"
echo "Branch:  $BRANCH"
echo "Brief:   $BRIEF_FILE"
echo ""
echo "Next:"
echo "  1. Read the brief and implement"
echo "  2. ./scripts/agent-quick-check.sh"
echo "  3. git add -A && git commit -m \"[cursor] …\""
echo "  4. ./scripts/agent-finish.sh \"[cursor] ${TITLE}\""
echo ""
echo "PR will auto-close issue #${ISSUE_NUM} on merge (Closes #${ISSUE_NUM})."
