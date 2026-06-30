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
  echo "Error: psql not found in PATH. Install the PostgreSQL client to run this script." >&2
  exit 3
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
