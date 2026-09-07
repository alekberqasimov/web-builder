#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="${1:-_site}"
PORT="${E2E_PORT:-4173}"
BASE="http://127.0.0.1:${PORT}"
LOG_FILE="${E2E_HTTP_LOG:-/tmp/web-builder-e2e-http.log}"

python3 -m http.server "$PORT" --directory "$SITE_DIR" >"$LOG_FILE" 2>&1 &
SERVER_PID=$!
cleanup(){
  kill "$SERVER_PID" 2>/dev/null || true
  rm -f tests/.e2e-deep-v6.tmp.mjs
}
trap cleanup EXIT

READY=0
for i in $(seq 1 30); do
  if curl -fsS "$BASE/" >/dev/null; then READY=1; break; fi
  sleep 1
done
if [ "$READY" -ne 1 ]; then
  echo "E2E server did not become ready" >&2
  cat "$LOG_FILE" >&2 || true
  exit 1
fi

export E2E_BASE_URL="$BASE"
run_test(){
  local spec="$1"
  local limit="${2:-120}"
  echo "::group::E2E ${spec}"
  timeout --signal=TERM "${limit}s" node "$spec"
  echo "E2E_OK ${spec}"
  echo "::endgroup::"
}

run_test tests/e2e-startup-resilience-v6.mjs 90
run_test tests/e2e.mjs 120
run_test tests/e2e-layout-v6.mjs 120
run_test tests/e2e-inspector-stability-v6.mjs 90
run_test tests/e2e-selection-inspector-v6.mjs 90
run_test tests/e2e-deep.mjs 180

cp tests/e2e-deep.mjs tests/.e2e-deep-v6.tmp.mjs
sed -i "s/classList.remove('left-collapsed','right-collapsed')/classList.add('left-collapsed','right-collapsed')/" tests/.e2e-deep-v6.tmp.mjs
run_test tests/.e2e-deep-v6.tmp.mjs 180
rm -f tests/.e2e-deep-v6.tmp.mjs

run_test tests/e2e-repeatable-v6.mjs 120
run_test tests/e2e-navigation-dnd-v6.mjs 120
run_test tests/e2e-ux-v6.mjs 120
run_test tests/e2e-custom-v6.mjs 120
run_test tests/e2e-site-languages-v6.mjs 120
run_test tests/e2e-theme-v6.mjs 120
run_test tests/e2e-ui-kit-v6.mjs 150
run_test tests/e2e-editor-premium-v6.mjs 120
run_test tests/e2e-premium-v3.mjs 120
run_test tests/e2e-responsive-preview-v6.mjs 120
run_test tests/e2e-functional-v6.mjs 150
run_test tests/e2e-seo-v6.mjs 120
run_test tests/e2e-quality-v6.mjs 120
run_test tests/e2e-advanced-layout-v6.mjs 120
run_test tests/e2e-reuse-v6.mjs 120
run_test tests/e2e-schema-builder-v6.mjs 120

echo "V6_BROWSER_GATE_OK"
