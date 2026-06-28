#!/bin/bash

# Ensure we exit on error
set -e

# Define the environments you want to push to (e.g., production, preview, development)
TARGET_ENVS="production"

# Define the specific keys from .env that are managed by pass-cli
KEYS=(
  "DATABASE_URI"
  "PAYLOAD_SECRET"
  "CRON_SECRET"
  "PREVIEW_SECRET"
  "BLOB_READ_WRITE_TOKEN"
  "VERCEL_OIDC_TOKEN"
  "ETSY_API_KEY"
  "ETSY_SHARED_SECRET"
)

echo "Pushing decrypted pass-cli secrets to Vercel..."

for key in "${KEYS[@]}"; do
  # Check if the environment variable was actually injected
  if [ -z "${!key}" ]; then
    echo "⚠️  Warning: $key is empty. Skipping..."
    continue
  fi

  # VERCEL_OIDC_TOKEN is auto-refreshed by Vercel at build/runtime. Seed it only
  # as an initial default — never clobber an existing (Vercel-managed) value.
  if [ "$key" = "VERCEL_OIDC_TOKEN" ]; then
    if npx vercel env ls $TARGET_ENVS 2>/dev/null | grep -qw "$key"; then
      echo "⏭️  $key already present in $TARGET_ENVS — leaving Vercel-managed value intact."
      continue
    fi
    echo "Seeding initial default for $key ($TARGET_ENVS)..."
    echo "${!key}" | npx vercel env add "$key" $TARGET_ENVS >/dev/null
    echo "✅ Seeded initial default for $key"
    continue
  fi

  echo "Syncing $key to Vercel ($TARGET_ENVS)..."

  # Remove the existing key first to prevent Vercel CLI interactive overwrite prompts
  npx vercel env rm "$key" $TARGET_ENVS -y >/dev/null 2>&1 || true

  # Pipe the decrypted value into vercel env add
  echo "${!key}" | npx vercel env add "$key" $TARGET_ENVS >/dev/null

  echo "✅ Successfully synced $key"
done

echo "🎉 All pass-cli secrets have been pushed to Vercel!"
