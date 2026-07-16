#!/usr/bin/env bash
set -euo pipefail

# Local build helper for reproducing CI/Vercel build locally.
# Usage: ./scripts/local-build.sh [--env-file FILE] [--skip-migrate] [--skip-tests] [--skip-lint] [--build-only]

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=.env
SKIP_MIGRATE=0
SKIP_TESTS=0
SKIP_LINT=0
BUILD_ONLY=0

print_usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --env-file FILE     Use FILE for environment (default: .env)
  --skip-migrate      Skip running migrations (skip 'pnpm run ci')
  --skip-tests        Skip running tests
  --skip-lint         Skip lint step
  --build-only        Only run the build (skip migrate/tests/lint)
  -h, --help          Show this message

Examples:
  # Full CI-like run (uses pass-cli if available to inject secrets):
  ./scripts/local-build.sh

  # Build-only without migrations or tests:
  ./scripts/local-build.sh --skip-migrate --skip-tests --skip-lint --build-only
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      ENV_FILE="$2"; shift 2;;
    --skip-migrate)
      SKIP_MIGRATE=1; shift;;
    --skip-tests)
      SKIP_TESTS=1; shift;;
    --skip-lint)
      SKIP_LINT=1; shift;;
    --build-only)
      BUILD_ONLY=1; SKIP_MIGRATE=1; SKIP_TESTS=1; SKIP_LINT=1; shift;;
    -h|--help)
      print_usage; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; print_usage; exit 2;;
  esac
done

echo "Root: $ROOT_DIR"
echo "ENV file: $ENV_FILE"

# Basic sanity checks
if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed or not on PATH." >&2
  exit 2
fi
NODE_VER=$(node -v | sed 's/^v//')
echo "Node version: $NODE_VER"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed. Install pnpm (https://pnpm.io/installation)" >&2
  exit 2
fi

# Use pass-cli to inject secrets when available and env file exists.
# If the env file contains pass:// refs, pass-cli is required.
CMD_PREFIX=""
if [[ -f "$ENV_FILE" ]]; then
  if grep -q "pass://" "$ENV_FILE"; then
    if ! command -v pass-cli >/dev/null 2>&1; then
      echo "Error: $ENV_FILE contains pass:// references but pass-cli is not available." >&2
      echo "Install/login pass-cli or provide a fully-resolved env file before building." >&2
      exit 2
    fi
    if [[ -z "${PROTON_PASS_AGENT_REASON-}" ]]; then
      export PROTON_PASS_AGENT_REASON="Secure local production build"
      echo "Note: PROTON_PASS_AGENT_REASON not set; using default: '${PROTON_PASS_AGENT_REASON}'"
    fi
    echo "$ENV_FILE contains pass:// refs — using pass-cli for secure env injection."
    CMD_PREFIX=(pass-cli run --env-file "$ENV_FILE" --)
  elif command -v pass-cli >/dev/null 2>&1; then
    echo "pass-cli found and $ENV_FILE exists — commands will run through pass-cli to inject secrets."
    CMD_PREFIX=(pass-cli run --env-file "$ENV_FILE" --)
  else
    echo "Note: $ENV_FILE exists but pass-cli is not available — ensure required secrets are available in env before running build."
  fi
else
  echo "Note: $ENV_FILE not found — running without env injection."
fi

run_cmd() {
  if [[ ${#CMD_PREFIX[@]} -gt 0 ]]; then
    "${CMD_PREFIX[@]}" "$@"
  else
    "$@"
  fi
}

echo "Installing dependencies..."
pnpm install

if [[ $SKIP_MIGRATE -eq 0 ]]; then
  echo "Running CI-like pipeline (migrations + build): pnpm run ci"
  run_cmd pnpm run ci
else
  echo "Skipping migrations. Running build only."
  run_cmd pnpm build
fi

if [[ $SKIP_LINT -eq 0 ]]; then
  echo "Running lint..."
  run_cmd pnpm lint
fi

if [[ $SKIP_TESTS -eq 0 ]]; then
  echo "Running integration tests (may require DB)..."
  if [[ -f "$ENV_FILE" && ${#CMD_PREFIX[@]} -gt 0 ]]; then
    run_cmd pnpm test:int
  else
    echo "Skipping integration tests: no env injection available or $ENV_FILE missing"
  fi
  echo "Running E2E tests (will spawn dev server)"
  run_cmd pnpm test:e2e
fi

echo "Local build script finished: all steps passed."
