#!/usr/bin/env bash
# Load gitignored .cursor/mcp.env for ops scripts (no secrets in repo).
#
# Usage (from repo root or any script):
#   # shellcheck source=scripts/lib/load-mcp-env.sh
#   source "$(dirname "$0")/../lib/load-mcp-env.sh"
#   load_mcp_env
#
# VERCEL_TOKEN is intentionally not exported: invalid tokens break `vercel` CLI
# OAuth sessions. Use `vercel login` / linked project for CLI checks.

load_mcp_env() {
  local repo_root="${1:-}"
  if [[ -z "$repo_root" ]]; then
    repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  fi

  local env_file="$repo_root/.cursor/mcp.env"
  [[ -f "$env_file" ]] || return 0

  local tmp
  tmp="$(mktemp "${TMPDIR:-/tmp}/mcp-env.XXXXXX")"
  # Last occurrence of each key wins (handles duplicate lines in mcp.env).
  tac "$env_file" | awk -F= '/^[A-Z_][A-Z0-9_]*=/ && !seen[$1]++' | tac >"$tmp"

  set -a
  while IFS= read -r line || [[ -n "${line:-}" ]]; do
    [[ -z "${line:-}" ]] && continue
    local key="${line%%=*}"
    [[ "$key" =~ ^[A-Z_][A-Z0-9_]*$ ]] || continue
    [[ "$key" == "VERCEL_TOKEN" ]] && continue
    export "$line"
  done <"$tmp"
  set +a
  rm -f "$tmp"
}
