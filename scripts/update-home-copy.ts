import 'dotenv/config'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '../src/payload.config'
import { createRichText, createHeading, createParagraph } from '../src/utilities/lexicalHelpers'

/**
 * Patches the LIVE "home" page copy in place to match the conversion edits in
 * src/endpoints/seed/home.ts. The home page renders from the database, so seed
 * edits alone don't change the live site — this surgically updates the three
 * changed blocks (hero, testimonials CTA, Inner Circle CTA) and leaves every
 * other block (archive intro, scent quiz, testimonial items, hero image,
 * subheading, secondary CTA) untouched. Idempotent and safe to re-run.
 *
 * Run where the DB env is present:
 *   npx tsx scripts/update-home-copy.ts
 * Requires: DATABASE_URI (or POSTGRES_URL) and PAYLOAD_SECRET.
 */

// Keep these strings in sync with src/endpoints/seed/home.ts
const HERO_HEADLINE = 'Candles made to make you stop.'
const HERO_PRIMARY_CTA = 'Shop the Collection'
const TESTIMONIALS_CTA_HEADING = 'Join the Inner Circle'
const TESTIMONIALS_CTA_BODY =
  'Batches are poured by hand, one at a time, and often sell out in days. Join for early access before each drop opens to the public.'
const INNER_CIRCLE_HEADLINE = 'Be first to every new batch.'
const INNER_CIRCLE_DESCRIPTION =
  'Batches are poured by hand, one at a time, and often sell out in days. Join the Inner Circle for early access before each drop — plus studio notes from Olesia as every candle comes to life.'

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  // find returns the published version by default (drafts enabled on Pages)
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  const home = docs[0]
  if (!home) {
    payload.logger.error("No page with slug 'home' found — nothing to update.")
    process.exit(1)
  }

  let patched = 0
  const layout = (home.layout ?? []).map((block) => {
    switch (block.blockType) {
      case 'storefrontHero':
        patched++
        return { ...block, headline: HERO_HEADLINE, primaryCtaLabel: HERO_PRIMARY_CTA }
      case 'testimonials':
        patched++
        return {
          ...block,
          richText: createRichText([
            createHeading(TESTIMONIALS_CTA_HEADING, 'h3'),
            createParagraph(TESTIMONIALS_CTA_BODY),
          ]),
        }
      case 'innerCircleCTA':
        patched++
        return { ...block, headline: INNER_CIRCLE_HEADLINE, description: INNER_CIRCLE_DESCRIPTION }
      default:
        return block
    }
  })

  if (patched === 0) {
    payload.logger.warn('Home page has none of the expected blocks — no changes written.')
    process.exit(1)
  }

  await payload.update({
    collection: 'pages',
    id: home.id,
    depth: 0,
    data: {
      // Round-tripping the read-typed layout back into update; cast to the
      // collection's input type, matching the pattern used in the seed files.
      layout: layout as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'],
      _status: 'published',
    },
    // Next's revalidatePath can't run from a standalone script; the live page
    // refreshes on the next ISR regeneration or after a redeploy / cache purge.
    context: { disableRevalidate: true },
  })

  payload.logger.info(`Home page copy updated successfully (patched ${patched} blocks).`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
