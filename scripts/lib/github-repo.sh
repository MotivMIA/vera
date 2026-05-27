#!/usr/bin/env bash
# Canonical GitHub repo slug for agent scripts.
# Override: export GITHUB_REPO=natew-dev/vera

DEFAULT_REPO="natew-dev/vera"

github_repo_slug() {
  echo "${GITHUB_REPO:-$DEFAULT_REPO}"
}
