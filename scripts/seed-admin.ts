import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@candera.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin'

async function seedAdmin(): Promise<void> {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    seedLogger.error('DATABASE_URI (or POSTGRES_URL/DATABASE_URL) is not set. Skipping admin seed.')
    process.exit(1)
  }

  seedLogger.info('Checking for existing admin user...')

  const payload = await getPayload({ config })

  // Check if any user already exists
  const { totalDocs: existingUserCount } = await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
  })

  if (existingUserCount > 0) {
    seedLogger.success(`Found ${existingUserCount} existing user(s) — no admin seeding needed`)
    return
  }

  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'password') {
    seedLogger.error(
      'Refusing to seed an admin without a non-default SEED_ADMIN_PASSWORD. Set the env var and rerun manually.',
    )
    process.exit(1)
  }

  // No users exist — create the initial admin
  seedLogger.info(`No users found. Creating admin user: ${ADMIN_EMAIL}`)

  await payload.create({
    collection: 'users',
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      roles: ['admin'],
      status: 'active',
    },
  })

  seedLogger.success('Admin user seeded successfully')
  seedLogger.info(`   Email:    ${ADMIN_EMAIL}`)
}

seedAdmin()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    seedLogger.error('Failed to seed admin user:', err)
    process.exit(1)
  })
