#!/usr/bin/env bash
# Load .env.dev or .env.prod into the process, then exec the given command.
# Falls back to legacy .env when the profile file is missing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-}"

if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
  echo "usage: with-env.sh <dev|prod> <command...>" >&2
  exit 1
fi

shift

if [[ $# -lt 1 ]]; then
  echo "usage: with-env.sh <dev|prod> <command...>" >&2
  exit 1
fi

ENV_FILE="${ROOT}/.env.${MODE}"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "${ROOT}/.env" ]]; then
    echo "note: ${ENV_FILE} not found — using legacy .env (see docs/ops/LOCAL_ENV.md)" >&2
    ENV_FILE="${ROOT}/.env"
  else
    echo "error: missing ${ENV_FILE} — run: cp .env.${MODE}.example .env.${MODE}" >&2
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

export VISUAL_ERA_ENV_PROFILE="$MODE"

exec "$@"
