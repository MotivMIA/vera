#!/usr/bin/env bash
# Delete remote agent branches already merged into origin/main.
# Usage: ./scripts/cleanup-merged-agent-branches.sh [--dry-run]
set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

REPO="${GITHUB_REPOSITORY:-natew-dev/vera}"
REMOTE="${GIT_REMOTE:-origin}"
BASE="${BASE_BRANCH:-main}"

git fetch -p "$REMOTE" "$BASE"

mapfile -t BRANCHES < <(
  git branch -r --merged "$REMOTE/$BASE" |
    sed -n 's|^[[:space:]]*'"$REMOTE"'/||p' |
    grep -E '^agent-(cursor|codex)-' ||
    true
)

if [[ ${#BRANCHES[@]} -eq 0 ]]; then
  echo "No merged agent branches to delete."
  exit 0
fi

echo "Merged agent branches on $REMOTE ($(( ${#BRANCHES[@]} ))):"
for branch in "${BRANCHES[@]}"; do
  echo "  - $branch"
done

if $DRY_RUN; then
  echo "Dry run — no branches deleted."
  exit 0
fi

for branch in "${BRANCHES[@]}"; do
  echo "Deleting $REMOTE/$branch ..."
  gh api -X DELETE "repos/${REPO}/git/refs/heads/${branch}" >/dev/null
done

echo "Done."
