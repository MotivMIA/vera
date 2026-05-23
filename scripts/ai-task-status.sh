#!/usr/bin/env bash
# AI workflow status: branch, PR, auto-merge, ownership warnings.
# Usage: ./scripts/ai-task-status.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

cd "$AGENT_GIT_ROOT"

BRANCH="$(current_branch)"
AGENT="$(agent_from_branch "$BRANCH")"
CHANGED="$(changed_files_vs_main)"

echo "=== AI task status ==="
echo "Branch:     $BRANCH"
echo "Agent:      $AGENT"
echo ""

if is_protected_branch "$BRANCH"; then
  echo "⚠️  On protected branch — start work with:"
  echo "    ./scripts/start-agent-task.sh cursor <feature-slug>"
  echo ""
elif is_valid_agent_branch "$BRANCH"; then
  echo "✓  Valid agent branch"
else
  echo "✗  Invalid branch name — use agent-<cursor|codex>-<feature>"
fi
echo ""

if git status --porcelain | grep -q .; then
  echo "Working tree: DIRTY"
  git status --short | head -12
else
  echo "Working tree: clean"
fi
echo ""

# PR + auto-merge
if command -v gh >/dev/null 2>&1; then
  if gh pr view --json url,number,state,autoMergeRequest 2>/dev/null | grep -q .; then
    PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
    PR_STATE="$(gh pr view --json state -q .state 2>/dev/null || true)"
    AUTO="$(gh pr view --json autoMergeRequest -q '.autoMergeRequest.enabledAt // empty' 2>/dev/null || true)"
    echo "Open PR:    $PR_URL ($PR_STATE)"
    if [[ -n "$AUTO" ]]; then
      echo "Auto-merge: enabled (merges when CI checks pass)"
    else
      echo "Auto-merge: not enabled — use ./scripts/open-agent-pr.sh or agent-finish.sh"
    fi
    echo ""
    echo "Checks:"
    gh pr checks 2>/dev/null | head -12 || echo "  (pending)"
  else
    echo "Pending PR: none"
    echo "  Ship with: ./scripts/agent-finish.sh \"[cursor] summary\""
  fi
else
  echo "gh CLI not found — install for PR/auto-merge status"
fi
echo ""

echo "Changed files vs main:"
if [[ -n "$CHANGED" ]]; then
  echo "$CHANGED" | head -20
  count="$(echo "$CHANGED" | grep -c . || true)"
  [[ "$count" -gt 20 ]] && echo "… ($count files total)"
else
  echo "  (none)"
fi
echo ""

echo "Ownership warnings:"
if ! report_cursor_owned_files; then
  if [[ "$AGENT" == "codex" ]]; then
    echo "→ Codex must not merge without Cursor review on these paths."
  else
    echo "→ High-attention paths — extra review before merge."
  fi
else
  echo "  None detected in diff vs main."
fi
echo ""

echo "Workflow lane:"
echo "  Orchestrator: ChatGPT (plans, filters Grok)"
echo "  Executor:     Cursor (default) | Codex (delegated only)"
echo "  Innovator:    Grok (briefs only, no repo)"
echo "  Safety:       GitHub CI + protected main"
echo ""
echo "Helpers:"
echo "  ./scripts/ai-review-summary.sh  — paste for Grok/ChatGPT"
echo "  ./scripts/agent-status.sh --pre-pr"
echo "  Docs: docs/AI_OPERATING_MODEL.md, docs/AI_TASK_FLOW.md"
echo ""
