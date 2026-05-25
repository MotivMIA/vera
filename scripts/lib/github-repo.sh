#!/usr/bin/env bash
# Canonical GitHub repo slug for agent scripts.
# Override: export GITHUB_REPO=Vera-Platforms/vera

DEFAULT_REPO="Vera-Platforms/vera"

github_repo_slug() {
  echo "${GITHUB_REPO:-$DEFAULT_REPO}"
}
