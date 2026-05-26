#!/usr/bin/env bash
# Bootstrap Cursor MCP config + gitignored .cursor/mcp.env (no secrets committed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MCP_JSON="$ROOT/.cursor/mcp.json"
MCP_ENV_EXAMPLE="$ROOT/.cursor/mcp.env.example"
MCP_ENV="$ROOT/.cursor/mcp.env"

mkdir -p "$ROOT/.cursor"

if [[ ! -f "$MCP_JSON" ]]; then
  cat >"$MCP_JSON" <<'JSON'
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    },
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
JSON
  echo "Created .cursor/mcp.json"
fi

if [[ ! -f "$MCP_ENV" ]]; then
  cp "$MCP_ENV_EXAMPLE" "$MCP_ENV"
  chmod 600 "$MCP_ENV"
  echo "Created .cursor/mcp.env from example (chmod 600)"
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  token="$(gh auth token 2>/dev/null || true)"
  if [[ -n "$token" ]]; then
    if grep -q '^GITHUB_PERSONAL_ACCESS_TOKEN=' "$MCP_ENV" 2>/dev/null; then
      if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s|^GITHUB_PERSONAL_ACCESS_TOKEN=.*|GITHUB_PERSONAL_ACCESS_TOKEN=${token}|" "$MCP_ENV"
      else
        sed -i "s|^GITHUB_PERSONAL_ACCESS_TOKEN=.*|GITHUB_PERSONAL_ACCESS_TOKEN=${token}|" "$MCP_ENV"
      fi
    else
      printf '\nGITHUB_PERSONAL_ACCESS_TOKEN=%s\n' "$token" >>"$MCP_ENV"
    fi
    echo "Synced GITHUB_PERSONAL_ACCESS_TOKEN from gh auth"
  fi
fi

cat <<EOF

Next steps:
  1. Fill remaining keys in .cursor/mcp.env (Cloudflare, Resend, Supabase; optional VERCEL_TOKEN).
  2. Cursor → Settings → MCP → enable GitHub / Supabase / Vercel (OAuth where prompted).
  3. Reload Cursor window.
  4. Run: ./scripts/ops/run-phase2-verify.sh

Docs: docs/ops/LOCAL_STACK_SETUP.md
EOF
