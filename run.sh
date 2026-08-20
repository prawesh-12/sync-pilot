#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-local}"
REDIS_PORT=6379
SIGNAL_PORT=8080
NEXT_BIN="node_modules/next/dist/bin/next"
WORKER_SERVICE_NAME="syncpilot-worker"
TSX_BIN="node_modules/.bin/tsx"

usage() {
  cat <<'EOF'
Usage: ./run.sh [local|production]

  local        Default. Hot reload everywhere. Reads .env.local.
  production   Builds the web app first. Reads .env.production.

Starts the web app, the intake server, and the worker together.
Stop all three with Ctrl+C.

Install dependencies first:
  cd server && pnpm install
  cd web && pnpm install

Redis and signal-cli are not started here:
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

fail() {
  echo "$1" >&2
  echo "  $2" >&2
  exit 1
}

requireEnvFile() {
  local relative="$1"
  [[ -f "$ROOT/$relative" ]] ||
    fail "Missing $relative" "Create it:  cp ${relative%.*}.example $relative"
}

requireDependencies() {
  local package="$1"
  local binary="$2"
  [[ -e "$ROOT/$package/$binary" ]] ||
    fail "Dependencies missing in $package/" "Run:  cd $package && pnpm install"
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
  local directory="$2"
  shift 2
  (cd "$ROOT/$directory" && exec "$@" 2>&1 | sed -u "s/^/[$label] /") &
}

stopAll() {
  trap - INT TERM EXIT
  echo
  echo "stopping"
  kill 0 2>/dev/null || true
}

requireEnvFile "web/.env.$MODE"
requireEnvFile "server/.env.$MODE"
requireDependencies "web" "$NEXT_BIN"
requireDependencies "server" "$TSX_BIN"

warnIfPortClosed "$REDIS_PORT" "redis"
warnIfPortClosed "$SIGNAL_PORT" "signal-cli"

export APP_ENV="$MODE"

if [[ "$MODE" == "local" ]]; then
  WORKER_SERVICE_NAME="syncpilot-worker-local"
fi

if [[ "$MODE" == "production" ]]; then
  echo "building web"
  (cd "$ROOT/web" && node --env-file=.env.production "$NEXT_BIN" build)
fi

trap stopAll INT TERM EXIT

echo "starting in $MODE mode"

if [[ "$MODE" == "local" ]]; then
  start web web "./$NEXT_BIN" dev
  start server server "./$TSX_BIN" watch server.ts
  start worker server env OTEL_SERVICE_NAME="$WORKER_SERVICE_NAME" "./$TSX_BIN" watch worker.ts
else
  # next start would otherwise let .env.local override .env.production.
  start web web node --env-file=.env.production "$NEXT_BIN" start
  start server server "./$TSX_BIN" server.ts
  start worker server env OTEL_SERVICE_NAME="$WORKER_SERVICE_NAME" "./$TSX_BIN" worker.ts
fi

wait
