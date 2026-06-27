import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'

const USERS_TO_SEED = [
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

async function seedInitialUsers(): Promise<void> {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    seedLogger.error(
      'DATABASE_URI (or POSTGRES_URL/DATABASE_URL) is not set. Skipping user seeding.',
    )
    process.exit(1)
  }

  seedLogger.info('Initializing Payload...')
  const payload = await getPayload({ config })

  for (const userData of USERS_TO_SEED) {
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
}

seedInitialUsers()
  .then(() => {
    seedLogger.success('Initial users seeding process complete.')
    process.exit(0)
  })
  .catch((err) => {
    seedLogger.error('Failed to seed initial users:', err)
    process.exit(1)
  })
