import { payloadLogger } from './logger'
import { isUnresolvedPassReference, resolveDatabaseConnectionString, isValidVercelBlobToken } from './resolveEnvValue'

/**
 * Consolidates startup validation checks for environment variables.
 * Verifies fatal secrets (database, Payload secret, Vercel Blob token in production)
 * and issues warning logs for missing non-fatal integration details (Etsy & SMTP/Resend).
 */
export function validateBootConfig(): void {
  // 1. Verify SECRETS (Fatal - throws on failure)
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is not set. Set this environment variable before starting.')
  }
  if (isUnresolvedPassReference(process.env.PAYLOAD_SECRET)) {
    throw new Error(
      'PAYLOAD_SECRET contains an unresolved pass:// reference. pass-cli URIs cannot be resolved on Vercel — set a real secret in environment variables.',
    )
  }
  payloadLogger.success('PAYLOAD_SECRET is successfully loaded.')

  const databaseConnectionString = resolveDatabaseConnectionString()
  if (!databaseConnectionString) {
    const hasPassReference =
      isUnresolvedPassReference(process.env.DATABASE_URI) ||
      isUnresolvedPassReference(process.env.POSTGRES_URL) ||
      isUnresolvedPassReference(process.env.DATABASE_URL)

    if (hasPassReference) {
      throw new Error(
        'DATABASE_URI/POSTGRES_URL contain unresolved pass:// references and no resolved Postgres connection string is available. Set a real connection string in Vercel environment variables or rely on the Neon integration POSTGRES_URL.',
      )
    }

    throw new Error(
      'DATABASE_URI (or POSTGRES_URL) is not set. Set a Postgres connection string before starting.',
    )
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const hasValidBlobToken = isValidVercelBlobToken(blobToken)

  if (process.env.VERCEL_ENV === 'production' && !hasValidBlobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN must be set to a valid Vercel Blob token in production.')
  }

  // 2. Verify Etsy & SMTP configs (Non-Fatal - logs startup warnings)
  const shopIdRaw = process.env.ETSY_SHOP_ID
  const isPassReference = shopIdRaw?.startsWith('pass://') === true
  const shopId = shopIdRaw && !isPassReference ? Number(shopIdRaw) : NaN
  const hasValidShopId = isPassReference || (Number.isInteger(shopId) && shopId > 0)
  const hasApiKey = !!process.env.ETSY_API_KEY
  const hasSharedSecret = !!process.env.ETSY_SHARED_SECRET

  const missingEtsy: string[] = []
  if (!shopIdRaw) {
    payloadLogger.info('ETSY_SHOP_ID is not set. Defaulting to Candera Candles shop (25894791).')
  } else if (!hasValidShopId) {
    payloadLogger.warn(
      `ETSY_SHOP_ID (${shopIdRaw}) is invalid (must be a positive integer). Defaulting to Candera Candles shop (25894791).`,
    )
  }
  if (!hasApiKey) {
    missingEtsy.push('ETSY_API_KEY')
  }
  if (!hasSharedSecret) {
    missingEtsy.push('ETSY_SHARED_SECRET')
  }

  if (missingEtsy.length > 0) {
    payloadLogger.warn(
      `Etsy integration is partially or fully unconfigured. Missing: ${missingEtsy.join(', ')}. Etsy sync features will fail or be disabled.`,
    )
  }

  const hasResend = !!process.env.RESEND_API_KEY
  const hasSmtp = !!process.env.SMTP_HOST

  if (!hasResend && !hasSmtp) {
    payloadLogger.warn(
      'Email delivery is using the fallback jsonTransport (no emails will be sent) because neither RESEND_API_KEY nor SMTP_HOST is set.',
    )
  } else if (hasSmtp && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    payloadLogger.warn(
      'SMTP_HOST is configured, but SMTP_USER or SMTP_PASS is not set. Outgoing email authentication might fail.',
    )
  }
}
