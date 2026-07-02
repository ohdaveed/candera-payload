#!/usr/bin/env bash
set -euo pipefail

# Vercel entrypoint: log safe diagnostics, then run the same pipeline as CI.
echo "=== Vercel build diagnostics ==="
echo "VERCEL_ENV=${VERCEL_ENV:-unset}"
echo "NODE_VERSION=$(node -v 2>/dev/null || echo unknown)"

for key in DATABASE_URI POSTGRES_URL DATABASE_URL DATABASE_URL_UNPOOLED POSTGRES_URL_NON_POOLING POSTGRES_PRISMA_URL PGHOST PGUSER PGPASSWORD PGDATABASE; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "${key}=<unset>"
  elif [[ "$value" == pass://* ]]; then
    echo "${key}=<pass:// reference>"
  else
    echo "${key}=<set>"
  fi
done

if [[ -n "${BLOB_READ_WRITE_TOKEN:-}" ]]; then
  if [[ "${BLOB_READ_WRITE_TOKEN}" == pass://* ]]; then
    echo "BLOB_READ_WRITE_TOKEN=<pass:// reference>"
  elif [[ "${BLOB_READ_WRITE_TOKEN}" =~ ^vercel_blob_rw_[^_]+_.+ ]]; then
    echo "BLOB_READ_WRITE_TOKEN=<valid format>"
  else
    echo "BLOB_READ_WRITE_TOKEN=<set but invalid format>"
  fi
else
  echo "BLOB_READ_WRITE_TOKEN=<unset>"
fi

if [[ -n "${PAYLOAD_SECRET:-}" ]]; then
  if [[ "${PAYLOAD_SECRET}" == pass://* ]]; then
    echo "PAYLOAD_SECRET=<pass:// reference>"
  else
    echo "PAYLOAD_SECRET=<set>"
  fi
else
  echo "PAYLOAD_SECRET=<unset>"
fi

echo "=== Running pnpm run ci ==="
pnpm run ci
