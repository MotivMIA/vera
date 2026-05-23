# GitHub issue JSON helpers for ai-issue-* scripts.
#   source "$SCRIPT_DIR/lib/gh-issue.sh"

gh_issue_require_tools() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "error: install GitHub CLI — https://cli.github.com/" >&2
    exit 1
  fi
  if ! command -v jq >/dev/null 2>&1; then
    echo "error: install jq — required for issue JSON parsing." >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "error: run gh auth login" >&2
    exit 1
  fi
}

# Fetch issue JSON; prints to stdout or errors to stderr (exit 1).
gh_issue_fetch_json() {
  local repo="$1"
  local number="$2"
  local out
  if ! out="$(gh issue view "$number" --repo "$repo" --json number,title,body,labels,url,state 2>&1)"; then
    echo "error: could not fetch issue #${number} from ${repo}." >&2
    echo "$out" >&2
    return 1
  fi
  if [[ -z "$out" ]]; then
    echo "error: empty response for issue #${number}." >&2
    return 1
  fi
  if ! jq -e . >/dev/null 2>&1 <<< "$out"; then
    echo "error: invalid JSON for issue #${number}." >&2
    echo "$out" >&2
    return 1
  fi
  printf '%s' "$out"
}

# Run jq filter on JSON string (never pass file paths).
jq_from_issue_json() {
  local json="$1"
  local filter="$2"
  jq -r "$filter" <<< "$json"
}

issue_has_label() {
  local json="$1"
  local name="$2"
  jq -e --arg n "$name" '.labels[]? | select(.name == $n)' <<< "$json" >/dev/null 2>&1
}

# Markdown section body until the next ## heading (macOS-safe).
issue_body_field() {
  local body="$1"
  local field="$2"
  awk -v f="$field" '
    $0 == "## " f { in_section=1; next }
    in_section && /^## / { exit }
    in_section && $0 !~ /^[[:space:]]*$/ { print }
  ' <<< "$body"
}

# First non-empty line of a section, flattened to one line.
issue_body_field_value() {
  issue_body_field "$1" "$2" | head -1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

strip_bracket_title_prefix() {
  echo "$1" | sed 's/^\[[^]]*\][[:space:]]*//'
}

# True when the checked owner checkbox is Codex (not unchecked "[ ] Codex" lines).
owner_suggests_codex() {
  issue_body_field "$1" "Suggested owner" | grep -qiE '^[[:space:]]*-?[[:space:]]*\[[xX]\][[:space:]]*Codex'
}

issue_slug_from_title_and_body() {
  local number="$1"
  local title="$2"
  local body="$3"
  local slug
  slug="$(slugify "$(strip_bracket_title_prefix "$title")")"
  if [[ -z "$slug" ]]; then
    slug="$(slugify "$(issue_body_field_value "$body" "Goal")")"
  fi
  slug="${slug:-task}"
  echo "issue-${number}-${slug}"
}
