#!/usr/bin/env bash
# Create or update GitHub labels for the mobile AI task workflow.
# Safe to rerun — skips labels that already exist.
# Usage: ./scripts/setup-ai-issue-labels.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/github-repo.sh
source "$SCRIPT_DIR/lib/github-repo.sh"
REPO="$(github_repo_slug)"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: install GitHub CLI — https://cli.github.com/" >&2
  exit 1
fi

# name|color|description
LABELS=(
  "ai-task|0E8A16|Structured AI/mobile task for Cursor intake"
  "mobile-task|1D76DB|Created from mobile ChatGPT workflow"
  "grok-idea|FBCA04|Product idea from Grok — triage before code"
  "cursor-accepted|0E8A16|Approved for Cursor implementation"
  "cursor-deferred|FEF2C0|Good idea — not scheduled"
  "cursor-rejected|D73A4A|Rejected — do not implement"
  "high-risk|B60205|Auth, prod, payments — human ack required"
  "low-risk|C2E0C6|Docs, copy, isolated UI"
  "product|5319E7|Product/feature scope"
  "ux|E99695|UX and onboarding"
  "bug|D73A4A|Bug fix"
  "enhancement|A2EEEF|Enhancement"
)

existing="$(gh label list --repo "$REPO" --limit 500 --json name -q '.[].name' 2>/dev/null || true)"

created=0
skipped=0
for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<< "$entry"
  if echo "$existing" | grep -qxF "$name"; then
    echo "skip: $name (exists)"
    skipped=$((skipped + 1))
    continue
  fi
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
    echo "created: $name"
    created=$((created + 1))
  else
    echo "skip: $name (create failed — may already exist)" >&2
    skipped=$((skipped + 1))
  fi
done

echo ""
echo "Done: ${created} created, ${skipped} skipped."
