// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// DATABASE_URL is required by neon(), but the canonical connection string is
// DATABASE_URI (vaulted). Fall back to DATABASE_URI, then POSTGRES_URL.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URI || process.env.POSTGRES_URL
}
