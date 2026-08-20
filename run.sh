#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-local}"
REDIS_PORT=6379
SIGNAL_PORT=8080

usage() {
  cat <<'EOF'
Usage: ./run.sh [local|production]

  local        Default. next dev with hot reload. Reads .env.local.
  production   next build, then next start. Reads .env.production.

Starts the web app, the intake server, and the worker together.
Stop all three with Ctrl+C.

Redis and signal-cli are not started here. Run them first:
  docker compose up -d
EOF
}

case "$MODE" in
  local | production) ;;
  -h | --help)
    usage
    exit 0
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac

requireEnvFile() {
  local relative="$1"
  local example="$2"

  if [[ ! -f "$ROOT/$relative" ]]; then
    echo "Missing $relative" >&2
    echo "  Create it:  cp $example $relative" >&2
    exit 1
  fi
}

warnIfPortClosed() {
  local port="$1"
  local name="$2"

  if ! (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
    echo "warning: nothing is listening on port $port ($name)"
    echo "         run 'docker compose up -d' in another terminal"
  fi
}

start() {
  local label="$1"
  shift
  ("$@" 2>&1 | sed -u "s/^/[$label] /") &
}

stopAll() {
  trap - INT TERM EXIT
  echo
  echo "stopping"
  kill 0 2>/dev/null || true
}

requireEnvFile "web/.env.$MODE" "web/.env.example"
requireEnvFile "server/.env.$MODE" "server/.env.example"

warnIfPortClosed "$REDIS_PORT" "redis"
warnIfPortClosed "$SIGNAL_PORT" "signal-cli"

export APP_ENV="$MODE"

if [[ "$MODE" == "production" ]]; then
  echo "building web"
  (cd "$ROOT/web" && node --env-file=.env.production ./node_modules/.bin/next build)
fi

trap stopAll INT TERM EXIT

echo "starting in $MODE mode"

if [[ "$MODE" == "local" ]]; then
  start web bash -c "cd '$ROOT/web' && pnpm dev"
else
  # next start reads .env.local first, so the file is passed explicitly.
  start web bash -c "cd '$ROOT/web' && node --env-file=.env.production ./node_modules/.bin/next start"
fi

start server bash -c "cd '$ROOT/server' && pnpm start"
start worker bash -c "cd '$ROOT/server' && pnpm worker"

wait
