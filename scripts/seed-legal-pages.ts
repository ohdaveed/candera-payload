import 'dotenv/config'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { legalPage } from '../src/endpoints/seed/legal-pages'
import { seedLogger } from '../src/utilities/logger'

async function main(): Promise<void> {
  seedLogger.info('Seeding missing legal pages...')

  const payload = await getPayload({ config })

  const pagesToSeed = ['Shipping & Returns', 'Wholesale', 'Privacy Policy', 'Terms of Service']

  for (const title of pagesToSeed) {
    const slug = title.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')

    const existing = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    if (existing.docs.length > 0) {
      seedLogger.info(`Page '${title}' already exists, skipping.`)
      continue
    }

    seedLogger.info(`Creating page: ${title} (${slug})`)
    await payload.create({
      collection: 'pages',
      data: legalPage(title) as RequiredDataFromCollectionSlug<'pages'>,
    })
  }

  seedLogger.info('Updating Footer global with legal and assistance links...')

  // Find the contact page to link it in assistanceItems
  const contactPage = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'contact',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: {
      disableRevalidate: true,
    },
    data: {
      assistanceItems: [
        {
          link: {
            type: 'custom',
            label: 'Shipping & Returns',
            url: '/shipping-and-returns',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Wholesale',
            url: '/wholesale',
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.docs[0]?.id as number,
            },
          },
        },
      ],
      footerLinks: [
        {
          link: {
            type: 'custom',
            label: 'Privacy Policy',
            url: '/privacy-policy',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Terms of Service',
            url: '/terms-of-service',
          },
        },
      ],
    },
  })

  seedLogger.success('Legal pages seeded and Footer updated successfully!')
  process.exit(0)
}

main().catch((err) => {
  seedLogger.error('Seed failed:', err)
  process.exit(1)
})
