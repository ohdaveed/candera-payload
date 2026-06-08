import 'dotenv/config'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'
import { seedLogger } from '@/utilities/logger'

const DEFAULT_ADMIN_EMAIL = 'admin@example.com'
const DEFAULT_ADMIN_NAME = 'Admin'

const seedAdminEmail =
  process.env.SEED_ADMIN_EMAIL ?? process.env.BOOTSTRAP_EMAIL ?? DEFAULT_ADMIN_EMAIL
const seedAdminName =
  process.env.SEED_ADMIN_NAME ?? process.env.BOOTSTRAP_NAME ?? DEFAULT_ADMIN_NAME
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? process.env.BOOTSTRAP_PASSWORD

const bootstrapEmail = process.env.BOOTSTRAP_EMAIL ?? seedAdminEmail
const bootstrapName = process.env.BOOTSTRAP_NAME ?? seedAdminName
const bootstrapPassword = process.env.BOOTSTRAP_PASSWORD ?? seedAdminPassword

process.env.SEED_ADMIN_EMAIL = seedAdminEmail
process.env.SEED_ADMIN_NAME = seedAdminName

if (seedAdminPassword) {
  process.env.SEED_ADMIN_PASSWORD = seedAdminPassword
}

async function main(): Promise<void> {
  seedLogger.info('Starting full reseed...')

  const payload = await getPayload({ config })
  let user
  let createdBootstrapUser = false
  const { docs: users } = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  const totalDocs = users.length
  if (totalDocs === 0) {
    if (!bootstrapPassword) {
      console.error(
        'ERROR: BOOTSTRAP_PASSWORD or SEED_ADMIN_PASSWORD is required to bootstrap an admin user for ./scripts/reseed.ts',
      )
      process.exit(1)
    }

    if (!process.env.SEED_ADMIN_PASSWORD) {
      process.env.SEED_ADMIN_PASSWORD = bootstrapPassword
    }

    seedLogger.info('No users found — bootstrapping admin user for seed authentication...')
    createdBootstrapUser = true
    user = await payload.create({
      collection: 'users',
      data: { name: bootstrapName, email: bootstrapEmail, password: bootstrapPassword },
    })
  } else {
    user = users[0]
  }

  if (!user) {
    seedLogger.error('Failed to find or bootstrap an admin user.')
    process.exit(1)
  }

  const req = await createLocalReq({ user }, payload)

  seedLogger.info('Running seed...')
  await seed({ payload, req })

  if (createdBootstrapUser && bootstrapEmail !== seedAdminEmail) {
    seedLogger.info('Removing temporary bootstrap user...')
    await payload.delete({
      collection: 'users',
      depth: 0,
      where: { email: { equals: bootstrapEmail } },
    })
  }

  seedLogger.success('Reseed complete.')
  seedLogger.info(`  Admin: ${seedAdminEmail}`)
  process.exit(0)
}

main().catch((err) => {
  seedLogger.error('Reseed failed:', err)
  process.exit(1)
})
