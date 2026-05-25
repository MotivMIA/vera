#!/usr/bin/env bash
# Read-only: verify local git identity matches Visual Era standard.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

EXPECTED_EMAIL="${EXPECTED_GIT_EMAIL:-admin@visual-era.com}"
EXPECTED_NAME="${EXPECTED_GIT_NAME:-Visual Era Team}"

ops_log "Checking global git identity..."

email="$(git config --global user.email 2>/dev/null || true)"
name="$(git config --global user.name 2>/dev/null || true)"

if [[ "$email" == "$EXPECTED_EMAIL" ]]; then
  ops_ok "user.email = ${EXPECTED_EMAIL}"
else
  ops_fail "user.email is '${email:-<unset>}' — expected ${EXPECTED_EMAIL}"
  ops_log "  Fix: git config --global user.email \"${EXPECTED_EMAIL}\""
fi

if [[ "$name" == "$EXPECTED_NAME" ]]; then
  ops_ok "user.name = ${EXPECTED_NAME}"
else
  ops_warn "user.name is '${name:-<unset>}' — expected '${EXPECTED_NAME}'"
  ops_log "  Fix: git config --global user.name \"${EXPECTED_NAME}\""
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if gh api user/emails --jq '.[] | select(.email=="'"$EXPECTED_EMAIL"'") | .verified' 2>/dev/null | grep -q true; then
    ops_ok "GitHub has verified ${EXPECTED_EMAIL}"
  else
    ops_warn "GitHub: ${EXPECTED_EMAIL} not found or not verified — Settings → Emails"
  fi
else
  ops_skip "gh not available — skip GitHub email check"
fi

ops_log "Recent commits on current branch (author email only):"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git log -5 --format='%ae' 2>/dev/null | sort -u | while read -r ae; do
    if [[ "$ae" == "$EXPECTED_EMAIL" ]]; then
      ops_ok "commit author: ${ae}"
    else
      ops_warn "commit author: ${ae} (not ${EXPECTED_EMAIL})"
    fi
  done
else
  ops_skip "not inside a git work tree"
fi

ops_finish "verify-git-identity"
