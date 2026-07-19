/** `seed.ts owner-guide` — replace owner documentation (front-end content untouched). */
import { seedOwnerDocs } from '@/endpoints/seed/owner-docs'
import { initPayload, seedLogger } from './shared'

export const run = async (): Promise<void> => {
  const payload = await initPayload()
  seedLogger.info('Replacing owner documentation (front-end content untouched)...')
  await seedOwnerDocs(payload)
  seedLogger.success('Owner documentation refreshed.')
}
