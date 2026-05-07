#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-5127}"
rm -rf tmp/pages-smoke
mkdir -p tmp/pages-smoke
ln -s "$PWD/docs" tmp/pages-smoke/avida-digital-evolution

npx http-server tmp/pages-smoke -a 127.0.0.1 -p "$PORT" -c-1 >/tmp/avida-pages-smoke.log 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:$PORT/avida-digital-evolution/" >/dev/null; then
    break
  fi
  sleep 0.25
done

PLAYWRIGHT_BASE_URL="http://127.0.0.1:$PORT/avida-digital-evolution/" npx playwright test
