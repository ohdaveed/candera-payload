import { payloadLogger } from './logger'

const PASS_URI_PREFIX = 'pass://'

export function isUnresolvedPassReference(value: string | undefined): boolean {
  return value?.startsWith(PASS_URI_PREFIX) === true
}

/**
 * Returns the first configured Postgres connection string that is not an
 * unresolved pass:// reference.
 *
 * Vercel preview builds often inherit DATABASE_URI from a local .env (pass://)
 * while POSTGRES_URL is injected resolved by the Neon integration. Prefer the
 * usable value so migrate/build can connect.
 */
export function resolveDatabaseConnectionString(): string | undefined {
  const entries = [
    ['DATABASE_URI', process.env.DATABASE_URI],
    ['POSTGRES_URL', process.env.POSTGRES_URL],
    ['DATABASE_URL', process.env.DATABASE_URL],
  ] as const

  const passReferenceKeys = entries
    .filter(([, value]) => isUnresolvedPassReference(value))
    .map(([key]) => key)

  const resolved = entries
    .map(([, value]) => value)
    .find((value): value is string => Boolean(value) && !isUnresolvedPassReference(value))

  if (passReferenceKeys.length > 0 && resolved) {
    payloadLogger.warn(
      `Ignoring unresolved pass:// reference(s) in ${passReferenceKeys.join(', ')}. pass-cli URIs cannot be resolved on Vercel; using the Neon-provided connection string instead.`,
    )
  }

  return resolved
}
