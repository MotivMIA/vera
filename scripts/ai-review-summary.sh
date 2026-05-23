#!/usr/bin/env bash
# Generate a paste-ready summary for Grok/ChatGPT review.
# Usage: ./scripts/ai-review-summary.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

cd "$AGENT_GIT_ROOT"

BRANCH="$(current_branch)"
AGENT="$(agent_from_branch "$BRANCH")"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")"
CHANGED="$(changed_files_vs_main)"

PR_URL=""
PR_NUMBER=""
if command -v gh >/dev/null 2>&1; then
  PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
  PR_NUMBER="$(gh pr view --json number -q .number 2>/dev/null || true)"
fi

echo "=============================================="
echo "AI REVIEW SUMMARY — Visual Era"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=============================================="
echo ""
echo "## Context"
echo "- Branch: \`$BRANCH\`"
echo "- Agent: $AGENT"
echo "- Commit: \`$COMMIT\`"
if [[ -n "$PR_URL" ]]; then
  echo "- PR: $PR_URL (#${PR_NUMBER})"
else
  echo "- PR: (none — run ./scripts/agent-finish.sh when ready)"
fi
echo ""

echo "## Changed files (vs main)"
if [[ -n "$CHANGED" ]]; then
  echo '```'
  echo "$CHANGED"
  echo '```'
else
  echo "(none or origin/main not fetched)"
fi
echo ""

echo "## Risk areas (heuristic)"
RISK_FOUND=0
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if file_is_cursor_owned "$file"; then
    [[ "$RISK_FOUND" -eq 0 ]] && echo "- Cursor-owned / high-attention paths:"
    echo "  - $file"
    RISK_FOUND=1
  fi
done <<< "$CHANGED"
if [[ "$RISK_FOUND" -eq 0 ]]; then
  echo "- No Cursor-owned path patterns detected in diff (still review auth/UI if applicable)"
fi
echo ""

echo "## Testing notes"
echo "- Local: \`./scripts/agent-quick-check.sh\` (lint + typecheck)"
echo "- Full CI runs on PR: job **CI checks**"
if echo "$CHANGED" | grep -qE 'middleware|clerk|Clerk|__clerk'; then
  echo "- Clerk-related: \`npm run smoke:clerk-proxy\` after deploy"
fi
echo ""

echo "## Summary template (fill in)"
echo '```markdown'
echo "### What changed"
echo "- …"
echo ""
echo "### Why"
echo "- …"
echo ""
echo "### Risks / rollback"
echo "- …"
echo '```'
echo ""

echo "=============================================="
echo "PASTE INTO GROK / CHATGPT"
echo "=============================================="
echo ""
echo "Review this Visual Era change for product/UX/architecture fit."
echo "Rules: no repo edits; triage as implement now | consider later | reject | needs clarification."
echo ""
echo "Branch: $BRANCH | Commit: $COMMIT"
if [[ -n "$PR_URL" ]]; then
  echo "PR: $PR_URL"
fi
echo ""
echo "Files changed:"
if [[ -n "$CHANGED" ]]; then
  echo "$CHANGED" | sed 's/^/- /'
else
  echo "- (see git diff)"
fi
echo ""
echo "Ask for: strengths, friction, max 3 implement-now items, explicit rejects, questions for human."
echo "Templates: docs/prompts/grok-product-review.md, chatgpt-orchestration-review.md"
echo ""
