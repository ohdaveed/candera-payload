import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  const userEmail = 'admin@candera.com'
  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: userEmail } },
    limit: 1,
    depth: 0,
  })
  const user = users[0]
  if (!user) {
    console.error('User not found')
    process.exit(1)
  }

  console.log('Creating MCP API Key document...')
  const crypto = await import('node:crypto')
  const generatedKey = crypto.randomBytes(24).toString('hex')
  const created = await payload.create({
    collection: 'payload-mcp-api-keys',
    data: {
      user: user.id,
      label: 'Debug Key',
      description: 'Debugging apiKey creation',
      enableAPIKey: true,
      apiKey: generatedKey,
    },
  })

  console.log('Created object keys:', Object.keys(created))
  console.log('Created object:', JSON.stringify(created, null, 2))

  // Clean it up immediately so we don't leave debug keys around
  await payload.delete({
    collection: 'payload-mcp-api-keys',
    id: created.id,
  })
  console.log('Deleted debug key.')
}

main().catch(console.error)
