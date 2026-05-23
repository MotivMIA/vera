#!/usr/bin/env bash
# List and classify open AI/mobile GitHub issues for Cursor intake (read-only).
# Usage:
#   ./scripts/ai-issue-intake.sh           # list candidates
#   ./scripts/ai-issue-intake.sh 123       # intake one issue
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

REPO="${GITHUB_REPO:-MotivMIA/vera}"
INTAKE_LABELS=(ai-task mobile-task grok-idea)

if ! command -v gh >/dev/null 2>&1; then
  echo "error: install GitHub CLI — https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: run gh auth login" >&2
  exit 1
fi

list_open_ai_issues() {
  local query="repo:${REPO} is:issue is:open (label:ai-task OR label:mobile-task OR label:grok-idea)"
  gh search issues "$query" --json number,title,labels,updatedAt \
    --jq 'sort_by(.number) | .[] | "\(.number)\t\(.title)\t\([.labels[].name] | join(","))"' 2>/dev/null \
    || true
}

extract_field() {
  local body="$1"
  local field="$2"
  echo "$body" | sed -n "/^## ${field}\$/,\$p" | sed '1d;/^## /q' | sed '/^$/d' | head -5 | tr '\n' ' ' | sed 's/  */ /g;s/^ //;s/ $//'
}

has_label() {
  local labels_json="$1"
  local want="$2"
  echo "$labels_json" | jq -e --arg w "$want" '.[] | select(.name == $w)' >/dev/null 2>&1
}

classify_issue() {
  local number="$1"
  local title="$2"
  local body="$3"
  local labels_json="$4"

  local verdict="cursor-only"
  local action="start"
  local reason="Default Cursor implementation on agent-cursor-* branch."

  if has_label "$labels_json" "cursor-rejected"; then
    verdict="reject"
    action="none"
    reason="Label cursor-rejected — do not implement."
  elif has_label "$labels_json" "cursor-deferred"; then
    verdict="defer"
    action="none"
    reason="Label cursor-deferred — not scheduled."
  elif has_label "$labels_json" "grok-idea" && ! has_label "$labels_json" "cursor-accepted"; then
    verdict="defer"
    action="review"
    reason="Grok idea without cursor-accepted — ChatGPT/human triage first."
  fi

  local risk
  risk="$(extract_field "$body" "Risk level")"
  [[ -z "$risk" ]] && risk="$(extract_field "$body" "Risk Level")"
  risk="$(echo "$risk" | tr '[:upper:]' '[:lower:]')"

  if [[ "$risk" == *high* ]] || has_label "$labels_json" "high-risk"; then
    verdict="cursor-only"
    reason="High risk — Cursor only; human acknowledgment recommended before coding."
  fi

  local owner
  owner="$(extract_field "$body" "Suggested owner")"
  owner="$(echo "$owner" | tr '[:upper:]' '[:lower:]')"
  if [[ "$owner" == *codex* ]] && [[ "$verdict" != "reject" && "$verdict" != "defer" ]]; then
    verdict="codex-assisted"
    reason="Suggested owner includes Codex — Cursor supervises; Codex may implement scoped slice only."
  fi

  local do_not
  do_not="$(extract_field "$body" "Do-not-touch areas")"
  if echo "$do_not" | grep -qiE 'middleware|auth|clerk|env|payment|secret|migration'; then
    verdict="cursor-only"
    reason="Do-not-touch includes sensitive areas — Cursor-only; no Codex without explicit Cursor review."
  fi

  local priority
  priority="$(extract_field "$body" "Priority")"
  [[ -z "$priority" ]] && priority="(not set)"

  local slug
  slug="$(slugify "${title#\[*\]}")"
  slug="${slug:-task}"
  slug="issue-${number}-${slug}"

  echo "$verdict|$action|$reason|$priority|$risk|$slug"
}

print_issue_intake() {
  local number="$1"
  local json
  json="$(gh issue view "$number" --repo "$REPO" --json number,title,body,labels,url,state)"
  local state
  state="$(echo "$json" | jq -r .state)"
  if [[ "$state" != "OPEN" ]]; then
    echo "error: issue #${number} is not open (state: ${state})." >&2
    exit 1
  fi

  local title body url labels_json
  title="$(echo "$json" | jq -r .title)"
  body="$(echo "$json" | jq -r .body // "")"
  url="$(echo "$json" | jq -r .url)"
  labels_json="$(echo "$json" | jq -c .labels)"

  IFS='|' read -r verdict action reason priority risk slug <<< "$(classify_issue "$number" "$title" "$body" "$labels_json")"

  echo "=== AI issue intake — #${number} ==="
  echo "Title:     $title"
  echo "URL:       $url"
  echo "Labels:    $(echo "$labels_json" | jq -r '[.[].name] | join(", ")')"
  echo "Priority:  $priority"
  echo "Risk:      ${risk:-(not set)}"
  echo ""
  echo "Classification: $verdict"
  echo "Recommendation: $reason"
  echo ""

  case "$action" in
    none)
      if [[ "$verdict" == "reject" ]]; then
        echo "Action: Do not start. Close or leave labeled cursor-rejected."
      else
        echo "Action: Defer — remove blocker labels or add cursor-accepted when ready."
      fi
      echo ""
      echo "No branch commands (intake only)."
      return 0
      ;;
    review)
      echo "Action: Run ChatGPT mobile review — docs/prompts/mobile-chatgpt-task-review.md"
      echo "        Add label cursor-accepted when approved."
      echo ""
      ;;
  esac

  echo "Suggested branch slug: ${slug}"
  echo ""
  echo "Next commands:"
  echo "  ./scripts/start-ai-issue-task.sh ${number}"
  echo "  # implement from .agent/tasks/issue-${number}.md"
  echo "  ./scripts/agent-quick-check.sh"
  echo "  ./scripts/agent-finish.sh \"[cursor] ${title}\""
  echo ""
  echo "Brief preview (Goal):"
  extract_field "$body" "Goal" | sed 's/^/  /'
  echo ""
}

ISSUE_ARG="${1:-}"

if [[ -z "$ISSUE_ARG" ]]; then
  echo "=== Open AI / mobile issues (${REPO}) ==="
  echo ""
  rows="$(list_open_ai_issues)"
  if [[ -z "$rows" ]]; then
    echo "No open issues with labels: ${INTAKE_LABELS[*]}"
    echo ""
    echo "Create one from phone: docs/prompts/mobile-create-task.md"
    echo "Then: ./scripts/ai-issue-intake.sh <number>"
    exit 0
  fi

  printf "%-8s %-50s %s\n" "NUMBER" "TITLE" "LABELS"
  printf "%-8s %-50s %s\n" "------" "-----" "------"
  while IFS=$'\t' read -r num title labels; do
    [[ -z "$num" ]] && continue
    short_title="$title"
    if [[ ${#short_title} -gt 48 ]]; then
      short_title="${title:0:45}..."
    fi
    printf "%-8s %-50s %s\n" "#${num}" "$short_title" "$labels"
  done <<< "$rows"
  echo ""
  echo "Intake one issue: ./scripts/ai-issue-intake.sh <number>"
  exit 0
fi

if [[ ! "$ISSUE_ARG" =~ ^[0-9]+$ ]]; then
  echo "error: issue number must be numeric (got: $ISSUE_ARG)" >&2
  exit 1
fi

print_issue_intake "$ISSUE_ARG"
