#!/usr/bin/env bash
# Canonical GitHub repo slug for agent scripts.
# Override anytime: export GITHUB_REPO=visualera/vera
#
# Pre-migration default:  MotivMIA/vera
# Post-migration default: visualera/vera (update DEFAULT_REPO below after transfer)

DEFAULT_REPO="MotivMIA/vera"
# After migration is confirmed, change to:
# DEFAULT_REPO="visualera/vera"

github_repo_slug() {
  echo "${GITHUB_REPO:-$DEFAULT_REPO}"
}
