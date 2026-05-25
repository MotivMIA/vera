#!/usr/bin/env bash
# Create GitHub tracking issues for operational identity follow-up work.
# Usage: ./scripts/create-identity-followup-issues.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/github-repo.sh
source "$SCRIPT_DIR/lib/github-repo.sh"
REPO="$(github_repo_slug)"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: install GitHub CLI — https://cli.github.com/" >&2
  exit 1
fi

ensure_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO" --json name -q '.[].name' | grep -qxF "$name"; then
    echo "label exists: $name"
  else
    if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
      echo "created label: $name"
    else
      echo "label exists: $name"
    fi
  fi
}

ensure_label security B60205 "Security and access hardening"
ensure_label ops 1D76DB "Operations and infrastructure"
ensure_label onboarding E99695 "Team onboarding and enablement"
ensure_label tracking FEF2C0 "Long-running checklist / tracking"
ensure_label documentation 0075CA "Documentation and guides"

create_if_missing() {
  local title="$1"
  local labels="$2"
  local body_file="$3"

  if gh issue list --repo "$REPO" --search "in:title \"$title\"" --state all --json title -q '.[].title' | grep -qxF "$title"; then
    echo "skip (exists): $title"
    return 0
  fi

  gh issue create --repo "$REPO" --title "$title" --label "$labels" --body-file "$body_file"
}

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

cat >"$tmpdir/issue-2fa.md" <<'EOF'
- Enable hardware security key 2FA on `vera.platforms@gmail.com`
- Ensure TOTP 2FA on MotivMIA GitHub personal account
- Store recovery codes offline
- Update security checklist in `docs/OPERATIONAL_IDENTITY.md` with evidence when complete

Refs: `docs/ACCOUNT_STRUCTURE.md`, `docs/OPERATIONAL_IDENTITY.md`
EOF

cat >"$tmpdir/issue-vaults.md" <<'EOF'
- Setup 1Password or Bitwarden organizational vault
- Create sub-vaults: Personal, Operations, Development
- Assign access per `docs/ACCOUNT_STRUCTURE.md`
- Distribute access to team members

Refs: `docs/ACCOUNT_STRUCTURE.md`
EOF

cat >"$tmpdir/issue-git.md" <<'EOF'
- Distribute `docs/GIT_CONFIG_SETUP.md` to all developers
- Verify all have `admin@visual-era.com` configured globally
- Audit commits for the next week
- Follow up on any misconfigurations

Refs: `docs/GIT_CONFIG_SETUP.md`, `docs/ops/TEAM_ANNOUNCEMENT.md`
EOF

cat >"$tmpdir/issue-hardening.md" <<'EOF'
Track security hardening from `docs/ACCOUNT_STRUCTURE.md`:

**Immediate (week 1)**
- [ ] 2FA on MotivMIA GitHub (TOTP)
- [ ] `admin@visual-era.com` on GitHub verified emails
- [ ] Hardware security key for `vera.platforms@gmail.com`
- [ ] Cloudflare email routing (all 5 aliases) — see `docs/ops/CLOUDFLARE_EMAIL_ROUTING.md`

**Short term (month 1)**
- [ ] Password manager vault structure
- [ ] 2FA on service accounts (Vercel, Clerk, Supabase, Resend)
- [ ] Recovery codes stored offline
- [ ] Developer git config audit

**Medium term (months 2–3)**
- [ ] Audit logging
- [ ] Incident response procedures (expanded)
- [ ] Team access policy
- [ ] Infrastructure change alerts

**Long term (ongoing)**
- [ ] Quarterly incident drills
- [ ] Access reviews
EOF

create_if_missing "Enforce 2FA on All Accounts" "security,ops" "$tmpdir/issue-2fa.md"
create_if_missing "Setup Password Manager Vault Structure" "security,ops" "$tmpdir/issue-vaults.md"
create_if_missing "Onboard Developers with Standardized Git Identity" "onboarding,documentation" "$tmpdir/issue-git.md"
create_if_missing "Complete Security Hardening Timeline" "security,tracking" "$tmpdir/issue-hardening.md"

echo ""
echo "Done. List open issues: gh issue list --repo $REPO --label security"
