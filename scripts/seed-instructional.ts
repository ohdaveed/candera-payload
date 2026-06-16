import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'
import type { File } from 'payload'
import type { Product, Post } from '@/payload-types'

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch file from ${url}`)
  const data = await res.arrayBuffer()
  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()?.split('?')[0] || 'jpeg'}`,
    size: data.byteLength,
  }
}

async function seedInstructional() {
  const payload = await getPayload({ config })
  seedLogger.info('Seeding instructional candle content...')

  // 0. Get Author
  const { docs: users } = await payload.find({ collection: 'users', limit: 1 })
  const authorId = users[0]?.id || 1

  // 1. Create Folders
  seedLogger.info('Creating folders...')
  const guideFolder = await payload.create({
    collection: 'folders',
    data: { name: 'Instructional Guides' },
  })
  const practiceFolder = await payload.create({
    collection: 'folders',
    data: { name: 'Practice Assets' },
  })

  // 2. Create Media
  seedLogger.info('Seeding media...')
  const candleImage = await fetchFileByURL('https://picsum.photos/id/1060/800/600') // Coffee/Candle-ish vibe
  const blogImage = await fetchFileByURL('https://picsum.photos/id/20/800/600') // Desktop/Writing vibe

  const media1 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Instructional Candle Image',
      // @ts-expect-error - folder field added by folders: true
      parent: guideFolder.id,
    },
    file: candleImage,
  })

  const media2 = await payload.create({
    collection: 'media',
    data: {
      alt: 'Blog Practice Image',
      // @ts-expect-error
      parent: practiceFolder.id,
    },
    file: blogImage,
  })

  // 3. Create Products
  seedLogger.info('Seeding instructional products...')
  await payload.create({
    collection: 'products',
    data: {
      title: 'TUTORIAL: First Soy Candle',
      slug: 'tutorial-first-soy-candle',
      productType: 'candle',
      tagline: 'The perfect starting point for learning Payload.',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Use this product to practice editing fields. Notice the different tabs for Content and SEO.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 0,
      etsyListingId: 999901,
      vessel: 'TUT',
      productTag: 'New Release',
      meta: {
        title: 'TUTORIAL: First Soy Candle | Candera Admin Guide',
        description:
          'Learn how to fill out product details and SEO settings in Payload with this interactive example.',
        image: media1.id,
      },
      _status: 'published',
    } as unknown as Product,
  })

  await payload.create({
    collection: 'products',
    data: {
      title: 'PRACTICE: Your Custom Blend',
      slug: 'practice-custom-blend',
      productType: 'candle',
      tagline: 'Draft your own masterpiece.',
      description: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'This is a draft product. Try filling out the Scent Profile below and adding some specifications.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      price: 25,
      etsyListingId: 999902,
      vessel: 'PRAC',
      _status: 'draft',
    } as unknown as Product,
  })

  // 4. Create Posts
  seedLogger.info('Seeding instructional posts...')
  await payload.create({
    collection: 'posts',
    data: {
      title: 'GUIDE: Writing for the Botanical Journal',
      slug: 'guide-botanical-journal',
      author: authorId,
      heroImage: media2.id,
      meta: {
        title: 'How to Write Botanical Stories',
        description:
          'A tutorial on using the Payload Lexical editor to craft beautiful stories about candles and rituals.',
      },
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Payload uses a powerful block-based editor called Lexical. You can add images, links, and even custom blocks to your posts.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published',
    } as unknown as Post,
  })

  await payload.create({
    collection: 'posts',
    data: {
      title: 'TUTORIAL: Using Blocks in Payload',
      slug: 'tutorial-using-blocks',
      author: authorId,
      heroImage: media1.id,
      meta: {
        title: 'Mastering the Page Builder',
        description:
          'Learn how to use layout blocks to build dynamic landing pages for your candle studio.',
      },
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Blocks are the building blocks of your pages. Try adding a CTA block or a Media block to see how they look in the preview.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      _status: 'published',
    } as unknown as Post,
  })

  seedLogger.success('Instructional content seeded successfully!')
}

seedInstructional()
  .then(() => process.exit(0))
  .catch((err) => {
    seedLogger.error('Failed to seed instructional content:', err)
    process.exit(1)
  })
