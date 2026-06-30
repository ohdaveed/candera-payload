/**
 * The Vercel adapter (@payloadcms/db-vercel-postgres) speaks Neon's serverless
 * protocol and cannot connect to a plain Postgres server, so we only select it
 * for Neon-hosted databases and fall back to the standard adapter otherwise.
 *
 * Detection assumes Neon databases are addressed via a `*.neon.tech` hostname.
 * Other Vercel Postgres hostnames (e.g. `*.postgres.vercel-storage.com`) fall
 * through to the standard adapter, which still works over the regular Postgres
 * wire protocol. Empty or malformed connection strings also use the standard
 * adapter and fail at connect time instead of config time.
 */
import 'server-only'

export function shouldUseVercelPostgresAdapter(connectionString: string): boolean {
  if (!connectionString) {
    return false
  }

  try {
    const hostname = new URL(connectionString).hostname.toLowerCase()
    return hostname === 'neon.tech' || hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}
