# Shared helpers for agent branch workflow. Source from other scripts:
#   source "$(dirname "$0")/lib/agent-git.sh"

AGENT_GIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROTECTED_BRANCHES=(main master)

# agent-<cursor|codex|other>-<short-feature>
AGENT_BRANCH_REGEX='^agent-(cursor|codex|[a-z][a-z0-9-]*)-[a-z0-9][a-z0-9-]*$'

# Branches that skip agent naming checks (automation / bots)
SYSTEM_BRANCH_REGEX='^(dependabot/|dependabot-|renovate/|github-actions/|allcontributors/)'

# Path fragments — if a changed file matches, treat as Cursor-owned (supervisor review required).
CURSOR_OWNED_PATTERNS=(
  "middleware.ts"
  "app/api/"
  "lib/env.ts"
  "lib/didit.ts"
  "lib/security.ts"
  "supabase/migrations/"
  "migrations/"
  "vercel.json"
  "next.config"
  ".github/workflows/"
  "scripts/setup-github-branch-protection"
  "scripts/configure-vercel"
  "docs/VERCEL_DEPLOYMENT"
  ".env"
)

# Codex-friendly when scoped and approved by Cursor (informational).
CODEX_SAFE_HINTS=(
  "components/"
  "lib/utils"
  "scripts/agent-"
  "scripts/open-agent"
  "scripts/sync-main"
  "docs/"
  "**/*.test."
  "**/*.spec."
)

current_branch() {
  git -C "$AGENT_GIT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""
}

is_protected_branch() {
  local branch="${1:-$(current_branch)}"
  local b
  for b in "${PROTECTED_BRANCHES[@]}"; do
    [[ "$branch" == "$b" ]] && return 0
  done
  return 1
}

is_system_branch() {
  local branch="${1:-$(current_branch)}"
  [[ "$branch" =~ $SYSTEM_BRANCH_REGEX ]]
}

is_valid_agent_branch() {
  local branch="${1:-$(current_branch)}"
  [[ "$branch" =~ $AGENT_BRANCH_REGEX ]]
}

assert_not_on_main() {
  local branch="${1:-$(current_branch)}"
  if is_protected_branch "$branch"; then
    echo "error: refusing operation on protected branch '$branch'." >&2
    echo "Create an agent branch: ./scripts/start-agent-task.sh <cursor|codex> <feature>" >&2
    exit 1
  fi
}

validate_agent_branch_or_exit() {
  local branch="${1:-$(current_branch)}"
  if is_system_branch "$branch"; then
    return 0
  fi
  if is_valid_agent_branch "$branch"; then
    return 0
  fi
  echo "error: branch '$branch' does not match agent-<agent>-<feature>" >&2
  echo "Example: agent-cursor-multi-agent-workflow" >&2
  exit 1
}

assert_clean_worktree_or_exit() {
  if [[ -n "$(git -C "$AGENT_GIT_ROOT" status --porcelain)" ]]; then
    echo "error: uncommitted changes — commit, stash, or discard before starting a new task:" >&2
    git -C "$AGENT_GIT_ROOT" status --short >&2
    exit 1
  fi
}

agent_from_branch() {
  local branch="${1:-$(current_branch)}"
  if [[ "$branch" =~ ^agent-([^-]+)- ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "unknown"
  fi
}

# List files changed vs origin/main (or empty if main not fetched).
changed_files_vs_main() {
  git -C "$AGENT_GIT_ROOT" diff --name-only origin/main...HEAD 2>/dev/null \
    || git -C "$AGENT_GIT_ROOT" diff --name-only main...HEAD 2>/dev/null \
    || true
}

file_is_cursor_owned() {
  local file="$1"
  local pattern
  for pattern in "${CURSOR_OWNED_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

# Issue number from branch name (e.g. agent-cursor-issue-123-slug → 123).
agent_issue_number_from_branch() {
  local branch="${1:-$(current_branch)}"
  if [[ "$branch" =~ issue-([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

# Issue number from committed .agent/tasks/issue-N.md brief.
agent_issue_number_from_brief() {
  local brief
  for brief in "$AGENT_GIT_ROOT"/.agent/tasks/issue-*.md; do
    [[ -f "$brief" ]] || continue
    if [[ "$brief" =~ issue-([0-9]+)\.md$ ]]; then
      echo "${BASH_REMATCH[1]}"
      return 0
    fi
  done
  return 1
}

# Prefer brief file, then branch name.
agent_linked_issue_number() {
  agent_issue_number_from_brief 2>/dev/null || agent_issue_number_from_branch 2>/dev/null || true
}

# Slugify text for branch names (lowercase, hyphens, max 40 chars).
slugify() {
  local s="$1"
  s="$(echo "$s" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//;s/-$//;s/--*/-/g')"
  echo "${s:0:40}" | sed 's/-$//'
}

# Print cursor-owned paths among changed files; returns 1 if any found.
report_cursor_owned_files() {
  local found=0
  local file
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    if file_is_cursor_owned "$file"; then
      if [[ "$found" -eq 0 ]]; then
        echo "⚠️  Cursor-owned paths touched (Codex must not merge without Cursor review):"
        found=1
      fi
      echo "    - $file"
    fi
  done < <(changed_files_vs_main)
  return "$found"
}
