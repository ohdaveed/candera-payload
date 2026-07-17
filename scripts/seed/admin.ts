/** `seed.ts admin` — create the initial admin user when the users collection is empty. */
import { initPayload, requireDatabaseUrl, seedLogger } from './shared'

export const run = async (): Promise<void> => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@candera.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin'

  requireDatabaseUrl('Skipping admin seed.')

  seedLogger.info('Checking for existing admin user...')

  const payload = await initPayload()

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

  if (!adminPassword || adminPassword === 'password') {
    seedLogger.error(
      'Refusing to seed an admin without a non-default SEED_ADMIN_PASSWORD. Set the env var and rerun manually.',
    )
    process.exit(1)
  }

  // No users exist — create the initial admin
  seedLogger.info(`No users found. Creating admin user: ${adminEmail}`)

  await payload.create({
    collection: 'users',
    data: {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      roles: ['admin'],
      status: 'active',
    },
  })

  seedLogger.success('Admin user seeded successfully')
  seedLogger.info(`   Email:    ${adminEmail}`)
}
