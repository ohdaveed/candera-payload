/**
 * One-off, non-destructive migration of the *live* local DB to match the lean
 * homepage refactor (block reorder + journal limit + footer nav).
 *
 * Unlike a reseed, this preserves the existing blocks' media IDs and the
 * Etsy-synced products — it only reorders the home page's `layout` array in
 * place, retargets the posts archive to a single featured post, and rewrites
 * the footer nav items. Safe to re-run (idempotent).
 *
 *   pass-cli run --env-file .env -- pnpm tsx scripts/apply-homepage-lean.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

// Desired homepage order. Archives are disambiguated by relationTo.
const rank = (block: Record<string, unknown>): number => {
  const type = block.blockType
  if (type === 'storefrontHero') return 0
  if (type === 'theVessels') return 1
  if (type === 'archive' && block.relationTo === 'products') return 2
  if (type === 'scentQuiz') return 3
  if (type === 'testimonials') return 4
  if (type === 'archive' && block.relationTo === 'posts') return 5
  if (type === 'innerCircleCTA') return 6
  return 99 // anything unexpected sinks to the end, order otherwise preserved
}

const run = async () => {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0, // keep uploads/relationships as IDs so we can write them straight back
  })

  const home = docs[0]
  if (!home) {
    payload.logger.error('No home page found — nothing to update.')
    process.exit(1)
  }

  const layout = Array.isArray(home.layout)
    ? [...(home.layout as unknown as Record<string, unknown>[])]
    : []

  // Reorder in place (stable sort), and align archive limits with a fresh seed
  // (products → 6, featured posts → 1) so the migrated DB matches seed output
  // regardless of its prior limits.
  layout.sort((a, b) => rank(a) - rank(b))
  for (const block of layout) {
    if (block.blockType === 'archive' && block.relationTo === 'products') {
      block.limit = 6
    }
    if (block.blockType === 'archive' && block.relationTo === 'posts') {
      block.limit = 1
    }
  }

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout: layout as never },
    context: { disableRevalidate: true },
  })
  payload.logger.info(`Home layout reordered → ${layout.map((b) => b.blockType).join(' → ')}`)

  // Match the seed contract: About is a page reference (not a hard-coded path),
  // so the link survives an about-page slug change. Fall back to a custom path
  // only if the about page is missing.
  const aboutPage = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'about' } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  const aboutLink = aboutPage
    ? { type: 'reference', label: 'About', reference: { relationTo: 'pages', value: aboutPage.id } }
    : { type: 'custom', label: 'About', url: '/about' }

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    data: {
      navItems: [
        { link: { type: 'custom', label: 'Collection', url: '/products' } },
        { link: { type: 'custom', label: 'Journal', url: '/posts' } },
        { link: { type: 'custom', label: 'How To', url: '/how-to' } },
        { link: aboutLink as never },
      ],
    },
  })
  payload.logger.info('Footer nav updated → Collection · Journal · How To · About')

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
