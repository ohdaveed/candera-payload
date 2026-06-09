import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

// Lazy singleton — defers neon() until the first query so that importing
// this module without DATABASE_URL set (e.g. in CI unit tests that use the
// empty-query guard) does not throw at load time.
let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
    if (!url) {
      throw new Error('No database connection string found. Set DATABASE_URL or POSTGRES_URL.')
    }
    _sql = neon(url)
  }
  return _sql
}

// Tagged-template wrapper that lazily resolves the neon client.
// Using a function (not a Proxy) so tagged-template invocations work correctly.
export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getSql()(strings, ...values)) as NeonQueryFunction<false, false>
