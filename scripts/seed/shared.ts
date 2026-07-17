/**
 * Shared bootstrapping for all seed subcommands: Payload Local API init,
 * database env checks, and the tagged seed logger.
 *
 * Importing this module evaluates the full Payload config, so it must only be
 * loaded from within a subcommand module (never from the CLI dispatcher).
 */
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'
import type { User } from '@/payload-types'

export { seedLogger }

/** Exit with an error when no database connection string is configured. */
export const requireDatabaseUrl = (skipMessage: string): void => {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    seedLogger.error(`DATABASE_URI (or POSTGRES_URL/DATABASE_URL) is not set. ${skipMessage}`)
    process.exit(1)
  }
}

/** Initialize the Payload Local API instance shared by every subcommand. */
export const initPayload = (): Promise<Payload> => getPayload({ config })

/** First user in the users collection (shallow) — used to authenticate seed operations. */
export const findFirstUser = async (payload: Payload): Promise<User | undefined> => {
  const { docs } = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  return docs[0]
}
