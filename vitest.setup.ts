// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// DATABASE_URL is required by neon(), but we may only have POSTGRES_URL in .env
// Fallback to POSTGRES_URL if DATABASE_URL is not set
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL
}
