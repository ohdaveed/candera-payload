import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let cached: NeonQueryFunction<false, false> | undefined

function resolve(): NeonQueryFunction<false, false> {
  if (!cached) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set')
    }
    cached = neon(process.env.DATABASE_URL)
  }
  return cached
}

// Lazily initialize the Neon client so importing this module does not require
// DATABASE_URL to be present (e.g. during unit tests that never hit the DB).
// The proxy forwards both tagged-template calls (`sql\`...\``) and property
// access (`sql.transaction`) to the underlying client, resolved on first use.
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, argArray) {
    return (resolve() as unknown as (...args: unknown[]) => unknown)(...argArray)
  },
  get(_target, prop) {
    const client = resolve() as unknown as Record<string | symbol, unknown>
    const value = client[prop]
    return typeof value === 'function'
      ? (value as (...a: unknown[]) => unknown).bind(client)
      : value
  },
})
