import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@candera.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'password'
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin'

async function seedAdmin(): Promise<void> {
  console.log('🌱 Checking for existing admin user...')

  const payload = await getPayload({ config })

  // Check if any user already exists
  const { totalDocs: existingUserCount } = await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
  })

  if (existingUserCount > 0) {
    console.log(`✅ Found ${existingUserCount} existing user(s) — no admin seeding needed`)
    return
  }

  // No users exist — create the initial admin
  console.log(`👤 No users found. Creating admin user: ${ADMIN_EMAIL}`)

  await payload.create({
    collection: 'users',
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  })

  console.log('✅ Admin user seeded successfully')
  console.log(`   Email:    ${ADMIN_EMAIL}`)

  if (ADMIN_PASSWORD === 'password') {
    console.warn('   ⚠️  Using default password — set SEED_ADMIN_PASSWORD in production!')
  }
}

seedAdmin()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Failed to seed admin user:', err)
    process.exit(1)
  })