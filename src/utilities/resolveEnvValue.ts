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

function isUsableEnvValue(value: string | undefined): value is string {
  return Boolean(value) && !isUnresolvedPassReference(value) && value !== 'undefined'
}

const DATABASE_ENV_KEYS = [
  'DATABASE_URI',
  'DATABASE_URL',
  'POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL',
] as const

function buildConnectionStringFromPgParts(): string | undefined {
  const host = process.env.PGHOST
  const user = process.env.PGUSER
  const password = process.env.PGPASSWORD
  const database = process.env.PGDATABASE
  const port = process.env.PGPORT || '5432'

  if (
    !host ||
    !user ||
    !password ||
    !database ||
    isUnresolvedPassReference(host) ||
    isUnresolvedPassReference(user) ||
    isUnresolvedPassReference(password) ||
    isUnresolvedPassReference(database) ||
    isUnresolvedPassReference(port)
  ) {
    return undefined
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

/**
 * Returns the first configured Postgres connection string that is not an
 * unresolved pass:// reference.
 *
 * Vercel preview builds often inherit DATABASE_URI from a local .env (pass://)
 * while Neon injects DATABASE_URL or PG* variables at deploy time. Prefer the
 * usable value so migrate/build can connect.
 */
export function resolveDatabaseConnectionString(): string | undefined {
  const entries = DATABASE_ENV_KEYS.map((key) => [key, process.env[key]] as const)

  const passReferenceKeys = entries
    .filter(([, value]) => isUnresolvedPassReference(value))
    .map(([key]) => key)

  const resolved =
    entries
      .map(([, value]) => value)
      .find((value): value is string => isUsableEnvValue(value)) ??
    buildConnectionStringFromPgParts()

  if (passReferenceKeys.length > 0 && resolved) {
    payloadLogger.warn(
      `Ignoring unresolved pass:// reference(s) in ${passReferenceKeys.join(', ')}. pass-cli URIs cannot be resolved on Vercel; using the Neon-provided connection string instead.`,
    )
  }

  return resolved
}
