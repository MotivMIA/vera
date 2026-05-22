# Shared helpers for agent branch workflow. Source from other scripts:
#   source "$(dirname "$0")/lib/agent-git.sh"

AGENT_GIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROTECTED_BRANCHES=(main master)

# agent-<cursor|codex|other>-<short-feature>
AGENT_BRANCH_REGEX='^agent-(cursor|codex|[a-z][a-z0-9-]*)-[a-z0-9][a-z0-9-]*$'

# Branches that skip agent naming checks (automation / bots)
SYSTEM_BRANCH_REGEX='^(dependabot/|dependabot-|renovate/|github-actions/|allcontributors/)'

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

agent_from_branch() {
  local branch="${1:-$(current_branch)}"
  if [[ "$branch" =~ ^agent-([^-]+)- ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "unknown"
  fi
}
