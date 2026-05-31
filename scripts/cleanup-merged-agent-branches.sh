#!/usr/bin/env bash
# Delete remote agent branches whose PRs are merged (squash-merge safe).
# Usage: ./scripts/cleanup-merged-agent-branches.sh [--dry-run]
set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

REPO="${GITHUB_REPOSITORY:-natew-dev/vera}"
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"

OPEN_BRANCHES="$(gh pr list --repo "$REPO" --state open --json headRefName -q '.[].headRefName' | sort -u || true)"

BRANCHES=()
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  BRANCHES+=("$branch")
done < <(
  gh pr list --repo "$REPO" --state merged --limit 500 --json headRefName -q '.[].headRefName' |
    grep -E '^agent-(cursor|codex)-' |
    sort -u ||
    true
)

if [[ ${#BRANCHES[@]} -eq 0 ]]; then
  echo "No merged agent PR branches found."
  exit 0
fi

TO_DELETE=()
for branch in "${BRANCHES[@]}"; do
  if [[ -n "$CURRENT_BRANCH" && "$branch" == "$CURRENT_BRANCH" ]]; then
    continue
  fi
  if echo "$OPEN_BRANCHES" | grep -qx "$branch"; then
    continue
  fi
  if gh api "repos/${REPO}/git/ref/heads/${branch}" &>/dev/null; then
    TO_DELETE+=("$branch")
  fi
done

if [[ ${#TO_DELETE[@]} -eq 0 ]]; then
  echo "No remote agent branches left to delete."
  exit 0
fi

echo "Remote agent branches to delete (${#TO_DELETE[@]}):"
for branch in "${TO_DELETE[@]}"; do
  echo "  - $branch"
done

if $DRY_RUN; then
  echo "Dry run — no branches deleted."
  exit 0
fi

for branch in "${TO_DELETE[@]}"; do
  echo "Deleting origin/$branch ..."
  gh api -X DELETE "repos/${REPO}/git/refs/heads/${branch}" >/dev/null
done

echo "Done."
