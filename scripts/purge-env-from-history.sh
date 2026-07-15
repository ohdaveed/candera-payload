#!/usr/bin/env bash
# scripts/purge-env-from-history.sh
#
# OWNER ACTION REQUIRED — run this locally after rotating the leaked credential.
#
# Purges every .env* file (except .env.example) from the full git history using
# git filter-repo, then force-pushes to origin/main so that the credential is no
# longer recoverable from any branch or tag in the remote repository.
#
# Pre-requisites
# ──────────────
#   1. Rotate the Neon `neondb_owner` password in the Neon console FIRST, and
#      update DATABASE_URI in Vercel + any local .env files before running this.
#   2. Install git-filter-repo (pip install git-filter-repo  OR  brew install git-filter-repo).
#   3. Run from a *fresh clone* of the repository (not a worktree or shallow clone):
#        git clone git@github.com:ohdaveed/candera-payload.git candera-clean
#        cd candera-clean
#        ./scripts/purge-env-from-history.sh
#   4. Notify all collaborators to delete their local clones and re-clone after
#      the force-push completes.
#
# What this script does
# ─────────────────────
#   • Fetches the full history (--unshallow).
#   • Uses git filter-repo to remove the following paths from every commit:
#       .env.ci, .env.template, and any other .env.* file (except .env.example).
#   • Re-packs the repository to drop loose objects.
#   • Force-pushes the rewritten main branch and all tags to origin.
#
# WARNING: This rewrites history. All open PRs will need to be rebased onto the
# new main. All local clones will be invalidated.
#
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

# ── Preflight ────────────────────────────────────────────────────────────────

if ! command -v git-filter-repo &>/dev/null; then
  echo "ERROR: git-filter-repo is not installed."
  echo "  Install with:  pip install git-filter-repo"
  echo "  Or:            brew install git-filter-repo"
  exit 1
fi

if git rev-parse --is-shallow-repository 2>/dev/null | grep -q true; then
  echo "Detected shallow clone — unshallowing first…"
  git fetch --unshallow origin
fi

# Confirm the user really means to do this.
echo ""
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  WARNING: This will REWRITE GIT HISTORY and FORCE-PUSH to origin.  │"
echo "│  All collaborators must delete their local clones and re-clone.     │"
echo "│  Run ONLY after rotating the leaked Neon credential.                │"
echo "└─────────────────────────────────────────────────────────────────────┘"
echo ""
read -rp "Type 'PURGE' to confirm: " CONFIRM
if [[ "$CONFIRM" != "PURGE" ]]; then
  echo "Aborted."
  exit 0
fi

# ── Purge ────────────────────────────────────────────────────────────────────

echo ""
echo "Removing .env* files from history (keeping .env.example)…"

# Keep .env.example (the placeholder template); purge everything else.
git filter-repo \
  --path .env.ci --invert-paths \
  --path .env.template --invert-paths \
  --path-glob '.env.*' --invert-paths \
  --path .env.example \
  --force

# Ensure the template is re-added if filter-repo dropped it (it should not,
# but this is a safety net).
if [[ ! -f .env.example ]]; then
  echo "WARNING: .env.example was unexpectedly removed — please restore it manually."
fi

# Re-pack to drop any dangling blobs.
echo "Repacking repository…"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# ── Force-push ───────────────────────────────────────────────────────────────

echo "Force-pushing to origin…"
git push origin --force --all
git push origin --force --tags

echo ""
echo "Done. Please:"
echo "  1. Notify all collaborators to delete local clones and re-clone."
echo "  2. Check any open PRs — their base commits will have changed."
echo "  3. Verify the credential no longer appears in history:"
echo '     git log --all --full-history -S "neondb_owner" -- . | head'
