#!/usr/bin/env bash
set -euo pipefail

# Usage: dump-public-schema.sh [CONN_STR] [OUT_PATH]
# Defaults: CONN_STR => $DATABASE_URL, OUT_PATH => ./schema/public_schema.tsv

CONN=${1:-${DATABASE_URL:-}}
OUT=${2:-./schema/public_schema.tsv}

if [ -z "$CONN" ]; then
  echo "Error: no connection string provided and DATABASE_URL is not set." >&2
  echo "Usage: $0 '<CONN_STR>' [out_path]" >&2
  exit 2
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found in PATH." >&2
  if command -v docker >/dev/null 2>&1; then
    echo "Docker found — attempting to run psql in a temporary container..." >&2
    mkdir -p "$(dirname \"$OUT\")"
    # Use the official postgres image which includes the psql client.
    # Run psql in the container and stream output back to the host file.
    if docker run --rm postgres:16-alpine psql "$CONN" -c "$SQL" > "$OUT"; then
      echo "Wrote schema to: $OUT (via dockerized psql)"
      exit 0
    else
      echo "Dockerized psql failed to run or connect to the database." >&2
      exit 4
    fi
  else
    echo "Error: psql not found and docker is not available. Install 'psql' or 'docker' to run this script." >&2
    exit 3
  fi
fi

mkdir -p "$(dirname "$OUT")"

SQL="COPY (
  SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM information_schema.columns
  WHERE table_schema='public'
  ORDER BY table_name, ordinal_position
) TO STDOUT WITH CSV DELIMITER E'\t' HEADER;"

psql "$CONN" -c "$SQL" > "$OUT"

echo "Wrote schema to: $OUT"
