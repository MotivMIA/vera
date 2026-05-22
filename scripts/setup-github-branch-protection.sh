#!/usr/bin/env bash
# Enable branch protection on main (requires gh auth + admin on MotivMIA/vera).
set -euo pipefail

REPO="${GITHUB_REPO:-MotivMIA/vera}"
BRANCH="${PROTECTED_BRANCH:-main}"
REQUIRED_CHECK="${REQUIRED_STATUS_CHECK:-CI checks}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

echo "Applying branch protection to ${REPO}:${BRANCH}"
echo "Required status check: ${REQUIRED_CHECK}"
echo "(Run CI on a PR first if this check is not available in the dropdown yet.)"
echo ""

gh api "repos/${REPO}/branches/${BRANCH}/protection" \
  --method PUT \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "${REQUIRED_CHECK}" }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

echo ""
echo "Done. Verify at: https://github.com/${REPO}/settings/branches"
