#!/usr/bin/env zsh
# Generate pass:// references for all items/fields in a Proton Pass share (zsh)
# Usage: ./scripts/generate-pass-env.sh --share-id <SHARE_ID> [--out <file>] [--dry-run]

set -euo pipefail

SHARE_ID=""
OUT_FILE=""
DRY_RUN=false

usage() {
  cat <<EOF
Usage: $0 --share-id <SHARE_ID> [--out <file>] [--dry-run]

Generates lines of the form:
  ENV_VAR="pass://<SHARE_ID>/<ITEM_ID>/<field>"

Options:
  --share-id   Share ID (vault) to inspect (required)
  --out        Write output to file (overwrites)
  --dry-run    Print to stdout only
  -h, --help   Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --share-id)
      SHARE_ID="$2"; shift 2;;
    --out)
      OUT_FILE="$2"; shift 2;;
    --dry-run)
      DRY_RUN=true; shift;;
    -h|--help)
      usage; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; usage; exit 2;;
  esac
done

if [[ -z "$SHARE_ID" ]]; then
  echo "Error: --share-id is required" >&2
  usage
  exit 2
fi

if ! command -v pass-cli >/dev/null 2>&1; then
  echo "pass-cli not found; please install and login first" >&2
  exit 3
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; please install jq" >&2
  exit 3
fi

# Ensure agent sessions supply a reason; if not provided, set a sensible default
if [[ -z "${PROTON_PASS_AGENT_REASON-}" ]]; then
  export PROTON_PASS_AGENT_REASON="Generate pass env mappings"
  echo "Note: PROTON_PASS_AGENT_REASON not set; using default reason: '${PROTON_PASS_AGENT_REASON}'" >&2
fi

sanitize() {
  # Uppercase, replace non-alnum with _, collapse underscores
  echo "$1" | iconv -f utf8 -t ascii//TRANSLIT 2>/dev/null | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9]/_/g' | sed 's/_\+/_/g' | sed 's/^_//;s/_$//'
}

TMP_OUT=$(mktemp)

echo "Listing items in share ${SHARE_ID}..." >&2
ITEMS_JSON=$(pass-cli item list --share-id "$SHARE_ID" --output json) || {
  echo "pass-cli failed to list items for share ${SHARE_ID}" >&2
  rm -f "$TMP_OUT"
  exit 4
}

echo "$ITEMS_JSON" | jq -c '.items[]' | while read -r ITEM; do
  ITEM_ID=$(echo "$ITEM" | jq -r '.id // empty')
  TITLE=$(echo "$ITEM" | jq -r '.title // empty')
  if [[ -z "$ITEM_ID" ]]; then
    continue
  fi

  # Without viewing the item (avoids CLI flag parsing issues for some item IDs),
  # offer a small set of common candidate field names to reference.
  FIELD_NAMES="password username api_key secret token note"

  for FIELD in ${(z)FIELD_NAMES}; do
    # Build an environment variable name suggestion
    S_TITLE=$(sanitize "$TITLE")
    S_FIELD=$(sanitize "$FIELD")
    if [[ -n "$S_TITLE" && -n "$S_FIELD" ]]; then
      ENV_KEY="${S_TITLE}_${S_FIELD}"
    elif [[ -n "$S_TITLE" ]]; then
      ENV_KEY="${S_TITLE}_FIELD_${S_FIELD}"
    else
      ENV_KEY="ITEM_${ITEM_ID}_${S_FIELD}"
    fi

    REFERENCE="pass://${SHARE_ID}/${ITEM_ID}/${FIELD}"
    echo "${ENV_KEY}='${REFERENCE}'" >> "$TMP_OUT"
  done
done

if [[ "$DRY_RUN" == true || -z "$OUT_FILE" ]]; then
  cat "$TMP_OUT"
else
  mv "$TMP_OUT" "$OUT_FILE"
  chmod 600 "$OUT_FILE"
  echo "Wrote ${OUT_FILE} (permissions 600)" >&2
fi

rm -f "$TMP_OUT"

exit 0
