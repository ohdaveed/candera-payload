// Any setup scripts you might need go here
import { vi } from 'vite-plus/test'
vi.mock('server-only', () => ({}))

// Load .env files
import 'dotenv/config'

// Guard: fail fast if tests are invoked without pass-cli and .env still
// contains unresolved pass:// references.
const PASSCLI_GUARD_KEYS = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'DATABASE_URL',
  'CRON_SECRET',
  'PREVIEW_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'VERCEL_OIDC_TOKEN',
  'ETSY_API_KEY',
  'ETSY_SHARED_SECRET',
]

for (const key of PASSCLI_GUARD_KEYS) {
  if (process.env[key]?.startsWith('pass://')) {
    throw new Error(
      'Unresolved pass:// URI detected in ' +
        key +
        '.\n' +
        'Integration tests require pass-cli to resolve secrets.\n' +
        'Run: pass-cli run --env-file .env -- pnpm test:int',
    )
  }
}

// DATABASE_URL is required by neon(), but the canonical connection string is
// DATABASE_URI (vaulted). Fall back to DATABASE_URI, then POSTGRES_URL.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URI || process.env.POSTGRES_URL
}
