/**
 * `seed.ts legal-pages` — create any missing legal pages and refresh the
 * Footer global's assistance/legal links.
 *
 * Page content, titles, AND slugs all come from the canonical `legalPage`
 * builder in src/endpoints/seed/legal-pages.ts — no re-implemented slug
 * derivation or hardcoded footer URLs here.
 */
import type { RequiredDataFromCollectionSlug } from 'payload'
import { legalPage } from '@/endpoints/seed/legal-pages'
import { initPayload, seedLogger } from './shared'

const LEGAL_PAGE_TITLES = ['Shipping & Returns', 'Wholesale', 'Privacy Policy', 'Terms of Service']

/** Canonical slug for a legal page, derived from the shared seed builder. */
const slugFor = (title: string): string => {
  const slug = legalPage(title).slug
  if (!slug) throw new Error(`legalPage('${title}') returned no slug`)
  return slug
}

/** Footer link entry pointing at a legal page by its canonical slug. */
const legalPageLink = (title: string) => ({
  link: {
    type: 'custom' as const,
    label: title,
    url: `/${slugFor(title)}`,
  },
})

export const run = async (): Promise<void> => {
  seedLogger.info('Seeding missing legal pages...')

  const payload = await initPayload()

  for (const title of LEGAL_PAGE_TITLES) {
    const data = legalPage(title) as RequiredDataFromCollectionSlug<'pages'>
    const slug = slugFor(title)

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
      data,
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
        legalPageLink('Shipping & Returns'),
        legalPageLink('Wholesale'),
        {
          link: {
            type: 'reference' as const,
            label: 'Contact',
            reference: {
              relationTo: 'pages' as const,
              value: contactPage.docs[0]?.id as number,
            },
          },
        },
      ],
      footerLinks: [legalPageLink('Privacy Policy'), legalPageLink('Terms of Service')],
    },
  })

  seedLogger.success('Legal pages seeded and Footer updated successfully!')
}
