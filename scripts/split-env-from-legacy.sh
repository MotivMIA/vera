#!/usr/bin/env bash
# Split a single .env into .env.local + .env.production.local
exec "$(cd "$(dirname "$0")" && pwd)/setup-env-files.sh" "$@"
