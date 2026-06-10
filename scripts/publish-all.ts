import { getPayload } from 'payload'
import config from '../src/payload.config'

async function publishAll() {
  const payload = await getPayload({ config })

  const collections = ['posts', 'pages', 'products'] as const

  for (const collection of collections) {
    payload.logger.info(`Publishing all drafts in ${collection}...`)

    const { docs } = await payload.find({
      collection,
      limit: 0,
      where: {
        _status: {
          equals: 'draft',
        },
      },
    })

    if (docs.length === 0) {
      payload.logger.info(`No drafts found in ${collection}.`)
      continue
    }

    payload.logger.info(`Found ${docs.length} drafts in ${collection}. Publishing...`)

    await Promise.all(
      docs.map((doc) =>
        payload.update({
          collection,
          id: doc.id,
          context: {
            disableRevalidate: true,
          },
          data: {
            _status: 'published',
          },
        }),
      ),
    )

    payload.logger.info(`Successfully published ${docs.length} documents in ${collection}.`)
  }

  process.exit(0)
}

publishAll().catch((err) => {
  console.error(err)
  process.exit(1)
})
