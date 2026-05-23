#!/usr/bin/env bash
# Fast local gate during iteration — lint + typecheck (no production build).
# Use often while committing on agent-*; does not open a PR.
# Usage: ./scripts/agent-quick-check.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies (first run)..."
  npm ci
fi

echo "Running lint + typecheck (parallel)..."
npm run lint &
pid_lint=$!
npm run typecheck &
pid_type=$!
wait "$pid_lint"
wait "$pid_type"
echo "OK — quick check passed. CI will run full build on the PR."
