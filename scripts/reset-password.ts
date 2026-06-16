import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function run() {
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'users',
    id: 20,
    data: { password: process.env.NEW_PASSWORD! },
  })
  console.log('Password updated for user 20')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
