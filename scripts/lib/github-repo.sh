#!/usr/bin/env bash
# Canonical GitHub repo slug for agent scripts.
# Override anytime: export GITHUB_REPO=Vera-Platforms/vera
#
# Current (live):     natew-dev/vera
# After transfer:     Vera-Platforms/vera (update DEFAULT_REPO when approved)

DEFAULT_REPO="natew-dev/vera"
# Post-migration (after explicit transfer approval):
# DEFAULT_REPO="Vera-Platforms/vera"

github_repo_slug() {
  echo "${GITHUB_REPO:-$DEFAULT_REPO}"
}
