/** `seed.ts initial-users` — idempotently create the primary/secondary admin users. */
import { initPayload, requireDatabaseUrl, seedLogger } from './shared'

export const run = async (): Promise<void> => {
  const usersToSeed = [
    {
      email: process.env.SEED_PRIMARY_ADMIN_EMAIL,
      password: process.env.SEED_PRIMARY_ADMIN_PASSWORD,
      name: process.env.SEED_PRIMARY_ADMIN_NAME || 'Primary Admin',
      roles: ['admin'] as ('admin' | 'editor')[],
    },
    {
      email: process.env.SEED_SECONDARY_ADMIN_EMAIL,
      password: process.env.SEED_SECONDARY_ADMIN_PASSWORD,
      name: process.env.SEED_SECONDARY_ADMIN_NAME || 'Secondary Admin',
      roles: ['admin'] as ('admin' | 'editor')[],
    },
  ]

  requireDatabaseUrl('Skipping user seeding.')

  seedLogger.info('Initializing Payload...')
  const payload = await initPayload()

  for (const userData of usersToSeed) {
    if (!userData.email || !userData.password) {
      seedLogger.info('Skipping seed user with missing email or password env vars.')
      continue
    }

    const email = userData.email
    const password = userData.password

    seedLogger.info(`Checking for user: ${userData.email}...`)

    const { totalDocs: existingCount } = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userData.email,
        },
      },
      limit: 1,
    })

    if (existingCount > 0) {
      seedLogger.info(`User ${userData.email} already exists. Skipping.`)
      continue
    }

    seedLogger.info(`Creating user: ${userData.email}...`)
    await payload.create({
      collection: 'users',
      data: {
        ...userData,
        email,
        password,
        status: 'active',
      },
    })
    seedLogger.success(`User ${userData.email} seeded successfully.`)
  }

  seedLogger.success('Initial users seeding process complete.')
}
