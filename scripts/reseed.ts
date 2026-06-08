import 'dotenv/config'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'
import { seedLogger } from '@/utilities/logger'

// Use environment variables for bootstrap credentials to avoid committing secrets.
const BOOTSTRAP_EMAIL = process.env.BOOTSTRAP_EMAIL ?? 'arrizon.david@pm.me'
const BOOTSTRAP_PASSWORD = process.env.BOOTSTRAP_PASSWORD
const BOOTSTRAP_NAME = process.env.BOOTSTRAP_NAME ?? 'David Arrizon'

if (!BOOTSTRAP_PASSWORD) {
  console.error(
    'ERROR: BOOTSTRAP_PASSWORD environment variable is required to run ./scripts/reseed.ts',
  )
  process.exit(1)
}

async function main(): Promise<void> {
  seedLogger.info('Starting full reseed...')

  const payload = await getPayload({ config })

  // Ensure at least one user exists so we can authenticate the seed request.
  // The seed function will delete and recreate all users itself.
  const { totalDocs } = await payload.find({ collection: 'users', limit: 1, depth: 0 })

  if (totalDocs === 0) {
    seedLogger.info('No users found — bootstrapping admin user for seed authentication...')
    await payload.create({
      collection: 'users',
      data: { name: BOOTSTRAP_NAME, email: BOOTSTRAP_EMAIL, password: BOOTSTRAP_PASSWORD },
    })
  }

  const { docs: users } = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  const req = await createLocalReq({ user: users[0] }, payload)

  seedLogger.info('Running seed...')
  await seed({ payload, req })

  seedLogger.success('Reseed complete.')
  seedLogger.info(`  Admin: ${BOOTSTRAP_EMAIL}`)
  process.exit(0)
}

main().catch((err) => {
  seedLogger.error('Reseed failed:', err)
  process.exit(1)
})
