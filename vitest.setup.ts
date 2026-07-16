// Any setup scripts you might need go here
import { vi } from 'vite-plus/test'
vi.mock('server-only', () => ({}))

// Load .env files
import 'dotenv/config'

import { assertNoUnresolvedPassRefs } from './tests/helpers/passGuard'

assertNoUnresolvedPassRefs('Integration tests', 'pass-cli run --env-file .env -- pnpm test:int')

// Boot validation requires PAYLOAD_SECRET to be present at module import time.
// In local/test environments where secrets are not injected via pass-cli,
// provide a deterministic dummy value so integration tests can start.
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'vitest-integration-test-secret'
}

// DATABASE_URL is required by neon(), but the canonical connection string is
// DATABASE_URI (vaulted). Fall back to DATABASE_URI, then POSTGRES_URL.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URI || process.env.POSTGRES_URL
}
