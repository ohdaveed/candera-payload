import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'
import { seedOwnerDocs } from '@/endpoints/seed/owner-docs'

async function run(): Promise<void> {
  const payload = await getPayload({ config })
  seedLogger.info('Replacing owner documentation (front-end content untouched)...')
  await seedOwnerDocs(payload)
}

run()
  .then(() => {
    seedLogger.success('Owner documentation refreshed.')
    process.exit(0)
  })
  .catch((err) => {
    seedLogger.error('Failed to refresh owner documentation:', err)
    process.exit(1)
  })
