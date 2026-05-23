#!/usr/bin/env bash
# Start a Cursor task from a GitHub issue: branch + local brief file.
# Usage: ./scripts/start-ai-issue-task.sh 123
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

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

if ! command -v gh >/dev/null 2>&1; then
  echo "error: install GitHub CLI — https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: run gh auth login" >&2
  exit 1
fi

assert_clean_worktree_or_exit

echo "Syncing main before issue branch..."
"$SCRIPT_DIR/sync-main.sh" --quiet

issue_json=""
if ! issue_json="$(gh issue view "$ISSUE_NUM" --repo "$REPO" --json number,title,body,labels,url,state 2>&1)"; then
  echo "error: could not fetch issue #${ISSUE_NUM} from ${REPO}." >&2
  echo "$issue_json" >&2
  exit 1
fi
if [[ -z "$issue_json" ]]; then
  echo "error: empty response for issue #${ISSUE_NUM}." >&2
  exit 1
fi

STATE="$(echo "$issue_json" | jq -r '.state // empty')"
if [[ -z "$STATE" || "$STATE" == "null" ]]; then
  echo "error: invalid JSON for issue #${ISSUE_NUM} (missing state)." >&2
  exit 1
fi
if [[ "$STATE" != "OPEN" ]]; then
  echo "error: issue #${ISSUE_NUM} is not open (state: ${STATE})." >&2
  exit 1
fi

TITLE="$(echo "$issue_json" | jq -r '.title // empty')"
BODY="$(echo "$issue_json" | jq -r '.body // empty')"
URL="$(echo "$issue_json" | jq -r '.url // empty')"
LABELS="$(echo "$issue_json" | jq -r '[.labels[].name] | join(", ") // empty')"

has_label() {
  echo "$issue_json" | jq -e --arg w "$1" '.labels[]? | select(.name == $w)' >/dev/null 2>&1
}

if has_label "cursor-rejected"; then
  echo "error: issue #${ISSUE_NUM} is cursor-rejected — will not start." >&2
  echo "Run: ./scripts/ai-issue-intake.sh ${ISSUE_NUM}" >&2
  exit 1
fi

if has_label "cursor-deferred"; then
  echo "error: issue #${ISSUE_NUM} is cursor-deferred — will not start." >&2
  exit 1
fi

if has_label "grok-idea" && ! has_label "cursor-accepted"; then
  echo "error: grok-idea without cursor-accepted — triage first." >&2
  echo "Run: ./scripts/ai-issue-intake.sh ${ISSUE_NUM}" >&2
  echo "Add label cursor-accepted when ChatGPT/human approves." >&2
  exit 1
fi

TITLE_SLUG="$(slugify "${TITLE#\[*\]}")"
TITLE_SLUG="${TITLE_SLUG:-task}"
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
