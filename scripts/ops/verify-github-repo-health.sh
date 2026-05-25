#!/usr/bin/env bash
# Read-only GitHub checks: branch protection context, open PRs, recent CI (requires gh).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=scripts/ops/lib/common.sh
source "$ROOT/scripts/ops/lib/common.sh"

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/github-repo.sh
source "$SCRIPT_DIR/lib/github-repo.sh"
REPO="$(github_repo_slug)"

if ! command -v gh >/dev/null 2>&1; then
  ops_skip "gh CLI not installed"
  ops_finish "verify-github-repo-health"
  exit 0
fi

if ! gh auth status >/dev/null 2>&1; then
  ops_skip "gh not authenticated — run: gh auth login"
  ops_finish "verify-github-repo-health"
  exit 0
fi

ops_log "GitHub: ${REPO} read-only health..."

default_branch="$(gh repo view "$REPO" --json defaultBranchRef -q '.defaultBranchRef.name' 2>/dev/null || echo main)"
ops_ok "Default branch: ${default_branch}"

open_prs="$(gh pr list --repo "$REPO" --state open --json number -q 'length' 2>/dev/null || echo 0)"
ops_ok "Open PRs: ${open_prs}"

if gh api "repos/${REPO}/branches/${default_branch}/protection" >/dev/null 2>&1; then
  ops_ok "Branch protection enabled on ${default_branch}"
else
  ops_warn "Could not read branch protection (permissions or not configured)"
fi

ops_finish "verify-github-repo-health"
