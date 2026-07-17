/** `seed.ts db` — full destructive content seed via src/endpoints/seed (overwrites data). */
import { createLocalReq } from 'payload'
import { seed } from '@/endpoints/seed'
import { findFirstUser, initPayload, seedLogger } from './shared'

export const run = async (): Promise<void> => {
  seedLogger.info('Starting database seed...')

  const payload = await initPayload()

  // Get an existing admin user to authenticate the seed request
  const user = await findFirstUser(payload)

  if (!user) {
    seedLogger.error('No admin users found. Run `pnpm seed:admin` first.')
    process.exit(1)
  }

  const req = await createLocalReq({ user }, payload)

  await seed({ payload, req })

  seedLogger.success('Database seeded successfully (photos uploaded to Vercel Blob)')
}
