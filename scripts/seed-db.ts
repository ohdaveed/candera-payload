import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...')

  const payload = await getPayload({ config })

  // Get an existing admin user to authenticate the seed request
  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
  })

  if (users.length === 0) {
    console.error('❌ No admin users found. Run `pnpm tsx scripts/seed-admin.ts` first.')
    process.exit(1)
  }

  const req = await createLocalReq({ user: users[0] }, payload)

  await seed({ payload, req })

  console.log('✅ Database seeded successfully (photos uploaded to Vercel Blob)')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
