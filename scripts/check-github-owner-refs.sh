#!/usr/bin/env bash
# Scan repo for GitHub owner/org slugs that may need updates after transfer.
# Does not modify files. Safe to run anytime.
#
# Usage: ./scripts/check-github-owner-refs.sh [--verbose]
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERBOSE="${1:-}"

cd "$ROOT"

GITHUB_PATTERNS=(
  'natew-dev'
  'MotivMIA'
  'Motiv-MIA'
  'visualera'
  'Vera-Platforms'
  'Visual-Era'
)

PRODUCT_HINTS=(
  'visual-era\.vercel\.app'
  'visual-era\.com'
  '@visual-era\.com'
)

scan() {
  local pat="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -c "$pat" --glob '!node_modules/**' --glob '!.git/**' --glob '!package-lock.json' \
      --glob '!.next/**' --glob '!scripts/check-github-owner-refs.sh' . 2>/dev/null \
      | awk -F: '{s+=$2} END {print s+0}'
  else
    grep -rE "$pat" --include='*' --exclude-dir=node_modules --exclude-dir=.git \
      --exclude-dir=.next --exclude=package-lock.json --exclude=check-github-owner-refs.sh . 2>/dev/null \
      | wc -l | tr -d ' '
  fi
}

scan_files() {
  local pat="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -l "$pat" --glob '!node_modules/**' --glob '!.git/**' --glob '!package-lock.json' \
      --glob '!.next/**' --glob '!scripts/check-github-owner-refs.sh' . 2>/dev/null | wc -l | tr -d ' '
  else
    grep -rEl "$pat" --include='*' --exclude-dir=node_modules --exclude-dir=.git \
      --exclude-dir=.next --exclude=package-lock.json --exclude=check-github-owner-refs.sh . 2>/dev/null \
      | wc -l | tr -d ' '
  fi
}

section() { echo ""; echo "=== $* ==="; }

section "GitHub ownership reference scan"
echo "Repo root: ${ROOT}"
echo "Intended canonical slug: natew-dev/vera"
echo "Canonical repo slug: natew-dev/vera"
echo ""

total_github=0
for pat in "${GITHUB_PATTERNS[@]}"; do
  count="$(scan "$pat")"
  files="$(scan_files "$pat")"
  total_github=$((total_github + count))
  printf '%-16s %4s matches in %2s files\n' "$pat" "$count" "$files"
  if [[ "$VERBOSE" == "--verbose" && "$count" -gt 0 ]]; then
    if command -v rg >/dev/null 2>&1; then
      rg -n "$pat" --glob '!node_modules/**' --glob '!.git/**' --glob '!package-lock.json' . 2>/dev/null | head -20
    else
      grep -rEn "$pat" --include='*' --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | head -20
    fi
    echo "  ..."
  fi
done

section "github.com/<owner>/vera URLs"
if command -v rg >/dev/null 2>&1; then
  rg -n 'github\.com/[^/[:space:]]+/vera' --glob '!node_modules/**' --glob '!.git/**' . 2>/dev/null || echo "(none)"
  url_count="$(rg -c 'github\.com/[^/[:space:]]+/vera' --glob '!node_modules/**' --glob '!.git/**' . 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')"
else
  grep -rEn 'github\.com/[^/[:space:]]+/vera' --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null || echo "(none)"
  url_count="$(grep -rE 'github\.com/[^/[:space:]]+/vera' --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l | tr -d ' ')"
fi
echo "Total URL matches: ${url_count}"

section "Scripts using GITHUB_REPO or DEFAULT_REPO"
grep -rEn 'GITHUB_REPO|DEFAULT_REPO|github_repo_slug' scripts docs .github 2>/dev/null || true

section "Local git remote"
if [[ -d .git ]]; then
  git remote -v 2>/dev/null || true
  echo ""
  echo "Compare remote owner to GitHub UI (canonical: natew-dev/vera)."
else
  echo "(not a git checkout)"
fi

section "Product / domain strings (usually keep — not GitHub owner)"
for pat in "${PRODUCT_HINTS[@]}"; do
  count="$(scan "$pat")"
  printf '%-24s %4s matches\n' "$pat" "$count"
done

section "Summary"
echo "GitHub slug matches (owners/legacy): ${total_github}"
echo "See docs/ops/GITHUB_ORG_MIGRATION.md for what to update after transfer."
