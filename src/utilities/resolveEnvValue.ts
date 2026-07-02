import { payloadLogger } from './logger'

const PASS_URI_PREFIX = 'pass://'

export function isUnresolvedPassReference(value: string | undefined): boolean {
  return value?.startsWith(PASS_URI_PREFIX) === true
}

/** Matches the format enforced by @vercel/blob: vercel_blob_rw_<store_id>_<random>. */
export function isValidVercelBlobToken(token: string | undefined): boolean {
  if (!token || isUnresolvedPassReference(token)) {
    return false
  }

  return /^vercel_blob_rw_[^_]+_.+/.test(token)
}

/**
 * Returns the first configured Postgres connection string that is not an
 * unresolved pass:// reference.
 *
 * Vercel preview builds often inherit DATABASE_URI from a local .env (pass://)
 * while POSTGRES_URL is injected resolved by the Neon integration. Prefer the
 * usable value so migrate/build can connect.
 */
const DATABASE_ENV_KEYS = [
  'DATABASE_URI',
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL',
] as const

export function resolveDatabaseConnectionString(): string | undefined {
  const entries = DATABASE_ENV_KEYS.map((key) => [key, process.env[key]] as const)

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
