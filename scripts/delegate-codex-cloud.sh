#!/usr/bin/env bash
# Prepare Codex / Cursor Cloud worker delegation (branch + brief + prompt).
# Cursor local supervises; worker does not open PRs.
#
# Usage:
#   ./scripts/delegate-codex-cloud.sh <feature-slug>
#   ./scripts/delegate-codex-cloud.sh <feature-slug> --print-only   # brief exists; print prompt only
#
# Example:
#   ./scripts/delegate-codex-cloud.sh onboarding-tests
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

FEATURE="${1:-}"
PRINT_ONLY=0
if [[ "${2:-}" == "--print-only" ]]; then
  PRINT_ONLY=1
fi

if [[ -z "$FEATURE" ]]; then
  echo "Usage: $0 <feature-slug> [--print-only]" >&2
  echo "Example: $0 onboarding-tests" >&2
  echo "Docs: docs/CODEX_CLOUD_DELEGATION.md" >&2
  exit 1
fi

FEATURE_SLUG="$(echo "$FEATURE" | tr '[:upper:]' '[:lower:]' | tr ' _' '-')"
BRANCH="agent-codex-${FEATURE_SLUG}"
DELEGATION_DIR="$AGENT_GIT_ROOT/.agent/delegation"
BRIEF_FILE="$DELEGATION_DIR/codex-${FEATURE_SLUG}.md"
PROMPT_FILE="$AGENT_GIT_ROOT/docs/prompts/codex-cloud-delegation.md"

if [[ "$PRINT_ONLY" -eq 0 ]]; then
  if [[ "$(current_branch)" != "$BRANCH" ]]; then
    "$SCRIPT_DIR/start-agent-task.sh" codex "$FEATURE_SLUG"
  else
    echo "Already on branch: $BRANCH"
  fi

  mkdir -p "$DELEGATION_DIR"
  if [[ ! -f "$BRIEF_FILE" ]]; then
    cat >"$BRIEF_FILE" <<EOF
# Codex cloud delegation — ${FEATURE_SLUG}

- branch: ${BRANCH}
- supervisor: Cursor (local)
- worker: Codex / Cursor Cloud

## Goal

<!-- One sentence -->

## Allow-list (files Codex may edit)

- 
- 

## Out of scope

- middleware.ts, lib/env.ts, lib/didit.ts, app/api/* (unless listed above)
- PR creation, merge, main

## Acceptance criteria

- [ ] 
- [ ] 

## Test plan

- [ ] \`./scripts/agent-quick-check.sh\`

## Handoff

Push \`[codex]\` commits to \`${BRANCH}\`. Cursor local reviews and runs \`agent-finish.sh\`.
EOF
    git -C "$AGENT_GIT_ROOT" add "$BRIEF_FILE"
    git -C "$AGENT_GIT_ROOT" commit -m "[cursor] add Codex cloud delegation brief for ${FEATURE_SLUG}"
    git -C "$AGENT_GIT_ROOT" push -u origin "$BRANCH" 2>/dev/null || git -C "$AGENT_GIT_ROOT" push origin "$BRANCH"
    echo ""
    echo "Created brief: $BRIEF_FILE"
    echo "Edit the brief (goal, allow-list, criteria), commit, push, then re-run with --print-only"
    echo ""
  fi
fi

if [[ ! -f "$BRIEF_FILE" ]]; then
  echo "error: brief not found: $BRIEF_FILE" >&2
  echo "Run without --print-only first." >&2
  exit 1
fi

echo "=============================================="
echo "CODEX / CURSOR CLOUD DELEGATION"
echo "=============================================="
echo ""
echo "Branch:  $BRANCH"
echo "Brief:   $BRIEF_FILE"
echo "Template: docs/prompts/codex-cloud-delegation.md"
echo ""
echo "--- Paste below into Cursor Cloud or Codex ---"
echo ""
echo "Read AGENTS.md. You are the Codex worker on branch \`${BRANCH}\` only."
echo ""
echo "Brief:"
echo ""
cat "$BRIEF_FILE"
echo ""
echo "Rules: [codex] commits; push branch; NO PR; NO main; run ./scripts/agent-quick-check.sh; hand off to Cursor local."
echo ""
echo "--- After cloud worker pushes ---"
echo ""
echo "  git fetch origin && git checkout $BRANCH && git pull"
echo "  ./scripts/agent-status.sh --pre-pr"
echo "  ./scripts/agent-quick-check.sh"
echo "  ./scripts/agent-finish.sh \"[cursor] <summary> (codex-assisted)\""
echo ""
