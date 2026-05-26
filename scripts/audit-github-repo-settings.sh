#!/usr/bin/env bash
# Read-only GitHub repo audit (names only for secrets — never values).
# Usage:
#   ./scripts/audit-github-repo-settings.sh
#   GITHUB_REPO=Vera-Platforms/vera ./scripts/audit-github-repo-settings.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/github-repo.sh
source "$SCRIPT_DIR/lib/github-repo.sh"
REPO="$(github_repo_slug)"
BRANCH="${PROTECTED_BRANCH:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: install GitHub CLI — https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: run gh auth login" >&2
  exit 1
fi

section() { echo ""; echo "=== $* ==="; }

section "Repository: ${REPO}"
if ! gh repo view "$REPO" --json \
  name,owner,visibility,defaultBranchRef,url,deleteBranchOnMerge,\
  mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,isInOrganization \
  --jq '{
    name,
    owner: .owner.login,
    owner_type: (if .isInOrganization then "Organization" else "User" end),
    visibility,
    default_branch: .defaultBranchRef.name,
    url,
    delete_branch_on_merge: .deleteBranchOnMerge,
    merge_commit: .mergeCommitAllowed,
    squash_merge: .squashMergeAllowed,
    rebase_merge: .rebaseMergeAllowed
  }' 2>/dev/null; then
  echo "Cannot read repo (permissions or missing)."
  exit 1
fi

section "Auto-merge (repo feature)"
gh api "repos/${REPO}" --jq '{allow_auto_merge, allow_update_branch}' 2>/dev/null || echo "(unavailable)"

section "Branch protection: ${BRANCH}"
if gh api "repos/${REPO}/branches/${BRANCH}/protection" 2>/dev/null | jq '{
  required_checks: .required_status_checks.contexts,
  strict: .required_status_checks.strict,
  pr_reviews_required: .required_pull_request_reviews.required_approving_review_count,
  dismiss_stale_reviews: .required_pull_request_reviews.dismiss_stale_reviews,
  conversation_resolution: .required_conversation_resolution.enabled,
  enforce_admins: .enforce_admins.enabled,
  allow_force_pushes: .allow_force_pushes.enabled,
  allow_deletions: .allow_deletions.enabled
}'; then
  :
else
  echo "No branch protection or insufficient permissions."
fi

section "GitHub Actions workflows"
gh workflow list --repo "$REPO" 2>/dev/null || echo "(none)"

section "Actions secrets (names only)"
if secrets="$(gh api "repos/${REPO}/actions/secrets" --jq '.secrets[].name' 2>/dev/null)"; then
  if [[ -n "$secrets" ]]; then
    echo "$secrets"
  else
    echo "(none — CI may use workflow env placeholders)"
  fi
else
  echo "(cannot list — permissions)"
fi

section "Actions variables (names only)"
if vars="$(gh api "repos/${REPO}/actions/variables" --jq '.variables[].name' 2>/dev/null)"; then
  if [[ -n "$vars" ]]; then
    echo "$vars"
  else
    echo "(none)"
  fi
else
  echo "(cannot list — permissions)"
fi

section "Webhooks (metadata only)"
if hooks="$(gh api "repos/${REPO}/hooks" 2>/dev/null)"; then
  echo "$hooks" | jq '[.[] | {id, name, active, events}]' 2>/dev/null || echo "(parse error)"
else
  echo "(cannot list)"
fi

section "Rulesets"
count="$(gh api "repos/${REPO}/rulesets" --jq 'length' 2>/dev/null || echo 0)"
echo "rulesets: ${count}"

section "Open PRs"
gh pr list --repo "$REPO" --state open --limit 10 2>/dev/null || true

section "Local git remote (if run from repo root)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -d "${ROOT}/.git" ]]; then
  git -C "$ROOT" remote -v 2>/dev/null || true
else
  echo "(not a git checkout)"
fi

echo ""
echo "Done. Compare output before/after migration. See docs/ops/GITHUB_ORG_MIGRATION.md"
