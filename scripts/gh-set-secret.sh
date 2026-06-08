#!/usr/bin/env bash
set -euo pipefail

# Usage: export PROTON_PASS_PERSONAL_ACCESS_TOKEN='pst_...' && ./scripts/gh-set-secret.sh
# Optionally also export PROTON_PASS_SHARE_ID to set that secret too.

detect_repo() {
  # Prefer GITHUB_REPOSITORY if set (CI), otherwise derive from git remote
  if [ -n "${GITHUB_REPOSITORY-}" ]; then
    echo "$GITHUB_REPOSITORY"
    return
  fi
  url=$(git remote get-url origin 2>/dev/null || true)
  if [ -z "$url" ]; then
    echo "Error: cannot determine repo. Set GITHUB_REPOSITORY or run this from a git clone with origin set." >&2
    exit 2
  fi
  # handle git@github.com:owner/repo.git and https://github.com/owner/repo.git
  if [[ "$url" =~ ^git@github.com:(.+)/(.+)(\.git)?$ ]]; then
    owner_repo="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    echo "$owner_repo"
    return
  fi
  if [[ "$url" =~ ^https?://[^/]+/(.+)/(.+)(\.git)?$ ]]; then
    owner_repo="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    echo "$owner_repo"
    return
  fi
  echo "Error: unexpected remote URL format: $url" >&2
  exit 2
}

REPO=$(detect_repo)

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://cli.github.com/" >&2
  exit 3
fi

if [ -z "${PROTON_PASS_PERSONAL_ACCESS_TOKEN-}" ]; then
  echo "PROTON_PASS_PERSONAL_ACCESS_TOKEN environment variable not set. Export it and re-run." >&2
  echo "Example: export PROTON_PASS_PERSONAL_ACCESS_TOKEN='pst_xxx::KEY'" >&2
  exit 4
fi

echo "Uploading PROTON_PASS_PERSONAL_ACCESS_TOKEN to repo: $REPO"
gh secret set PROTON_PASS_PERSONAL_ACCESS_TOKEN --repo "$REPO" --body "$PROTON_PASS_PERSONAL_ACCESS_TOKEN"

if [ -n "${PROTON_PASS_SHARE_ID-}" ]; then
  echo "Uploading optional PROTON_PASS_SHARE_ID to repo: $REPO"
  gh secret set PROTON_PASS_SHARE_ID --repo "$REPO" --body "$PROTON_PASS_SHARE_ID"
fi

echo "Secrets uploaded. Verify in GitHub → Settings → Secrets and variables → Actions." 
