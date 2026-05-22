#!/usr/bin/env bash
# Open a PR from the current agent branch to main.
# Usage: ./scripts/open-agent-pr.sh "Short title" [--draft]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/agent-git.sh
source "$SCRIPT_DIR/lib/agent-git.sh"

TITLE="${1:-}"
DRAFT=""
if [[ "${2:-}" == "--draft" ]]; then
  DRAFT="--draft"
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
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

# Ensure prefix matches commit convention
if [[ ! "$TITLE" =~ ^\[ ]]; then
  TITLE="[${AGENT}] ${TITLE}"
fi

if ! git -C "$AGENT_GIT_ROOT" rev-parse --abbrev-ref "@{u}" >/dev/null 2>&1; then
  echo "Pushing branch to origin first..."
  git -C "$AGENT_GIT_ROOT" push -u origin "$BRANCH"
else
  git -C "$AGENT_GIT_ROOT" push origin "$BRANCH" || true
fi

BODY_FILE="$(mktemp)"
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
- [ ] CI checks pass
- [ ] Vercel preview checked (if applicable)
- [ ] No secrets in diff
EOF

if [[ -n "$DRAFT" ]]; then
  gh pr create --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODY_FILE" --draft
else
  gh pr create --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODY_FILE"
fi
rm -f "$BODY_FILE"

echo ""
echo "PR opened. Wait for CI checks + branch naming before merge."
