import type { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

/**
 * Single source of truth for the homepage content + structure.
 *
 * Previously the homepage was defined three times (seed/home.ts, the static
 * fallback in seed/home-static.ts, and the now-removed /create-home endpoint),
 * which drifted apart. Both remaining definitions build from here:
 *  - seed/home.ts        → buildHomePage({ heroImageId, vesselImageIds, scentQuizFormId, scentQuizId })
 *  - seed/home-static.ts → buildHomePage()  (no media/quiz; used as the fallback)
 *
 * Canonical design (lead with the object, not the reading):
 *   hero → The Vessels → scentQuiz → testimonials → journal → product archive →
 *   innerCircleCTA. Status card shown, primary CTA → /products.
 */

// ── Copy ──────────────────────────────────────────────────────────────────────
const HERO_TAG = 'Handmade by Olesia'
const HERO_HEADLINE = 'Candles made to make you stop.'
const HERO_SUBHEADING =
  'Small-batch botanical pillars poured with slow-cured natural wax — crafted for the quiet, unhurried moments that belong entirely to you.'

const ETHOS_CARD_EYEBROW = 'The Slow Pour'
const ETHOS_CARD_BODY =
  'No factories. No white labeling. Just real pressed botanicals and slow light.'
const ETHOS_CARD_FOOTER_LABEL = 'Exclusively on Etsy'
const ETHOS_CARD_LINK_LABEL = 'Read Journal'

const VESSEL_EYEBROW = 'The Vessels'
const VESSEL_HEADING = 'Unlit. Unhurried.'
const VESSEL_ITEMS = [
  { label: 'Vessel 001', caption: 'Hand-finished stoneware' },
  { label: 'Vessel 002', caption: 'Pressed botanicals, set by hand' },
  { label: 'Vessel 003', caption: 'Natural wax, slow-cured' },
]

const SCENT_QUIZ_HEADLINE = 'Not sure where to start?'

const COLLECTION_HEADING = 'Not manufactured. Made.'
const COLLECTION_BODY =
  "Every Candera candle is designed, poured, decorated, and finished by hand — by Olesia, the founder and the only maker. The flowers are real. The herbs are real. No two are exactly alike. That's not a limitation — it's the point."

const JOURNAL_HEADING = 'From the Journal'
const JOURNAL_BODY =
  'Field notes from the studio — the science, the botanicals, and the craft behind every pour, from the only maker who pours them.'

const INNER_CIRCLE_HEADLINE = 'Be first to every new batch.'
const INNER_CIRCLE_DESCRIPTION =
  'Batches are poured by hand, one at a time, and often sell out in days. Join the Inner Circle for early access before each drop — plus studio notes from Olesia as every candle comes to life.'

export const HOME_META = {
  title: 'Candera Candles | Handmade Botanical Candles',
  description:
    'Handcrafted botanical candles made by one maker, one at a time. Real flowers, natural wax, clean burn — designed to bring a little more light and intention into your home.',
}

const TESTIMONIALS = [
  {
    quote:
      "I've burned through every trendy candle out there. These are different. You can feel the intention in every detail.",
    author: 'Elena R.',
    location: 'Los Angeles',
    badge: 'Verified Purchase',
  },
  {
    quote:
      'The botanicals are breathtaking. I keep the vessel on my shelf long after the candle is gone.',
    author: 'James T.',
    location: 'Austin',
    badge: 'Repeat Customer',
  },
  {
    quote:
      'Lighting this at the end of the day has become my ritual. It gives me permission to slow down.',
    author: 'Sarah L.',
    location: 'Brooklyn',
    badge: 'Verified Purchase',
  },
]

type BuildHomeArgs = {
  heroImageId?: string | number
  vesselImageIds?: (string | number)[]
  scentQuizFormId?: string | number
  scentQuizId?: string | number
}

export function buildHomePage(args: BuildHomeArgs = {}): RequiredDataFromCollectionSlug<'pages'> {
  const { heroImageId, vesselImageIds = [], scentQuizFormId, scentQuizId } = args

  // The Vessels block's item images are required, so only emit it when we have
  // something to show — each item falls back to the hero image. Omitted from
  // the static (pre-seed) fallback, which has no media at all.
  const vesselImage = (i: number) => vesselImageIds[i] ?? heroImageId
  const vesselsBlock =
    heroImageId || vesselImageIds.length
      ? [
          {
            blockName: 'The Vessels',
            blockType: 'theVessels',
            eyebrow: VESSEL_EYEBROW,
            heading: VESSEL_HEADING,
            items: VESSEL_ITEMS.map((item, i) => ({
              image: vesselImage(i),
              label: item.label,
              caption: item.caption,
            })),
          },
        ]
      : []

  const layout = [
    {
      blockName: 'Storefront Hero',
      blockType: 'storefrontHero',
      heroTag: HERO_TAG,
      headline: HERO_HEADLINE,
      subheading: HERO_SUBHEADING,
      ...(heroImageId ? { media: heroImageId } : {}),
      primaryCtaLabel: 'Shop the Collection',
      primaryCtaUrl: '/products',
      secondaryCtaLabel: 'Take the Scent Quiz →',
      secondaryCtaUrl: '#scent-quiz',
      showStatusCard: true,
      ethosCardEyebrow: ETHOS_CARD_EYEBROW,
      ethosCardBody: ETHOS_CARD_BODY,
      ethosCardFooterLabel: ETHOS_CARD_FOOTER_LABEL,
      ethosCardLinkLabel: ETHOS_CARD_LINK_LABEL,
      statusCardTitle: 'Current Pour',
      statusCardSubtitle: 'Series 01 · Batch of 50',
      statusCardStatus: 'Now Pouring',
      statusCardShips: 'Ships in 3–5 days',
      statusCardLinkUrl: '/products/seashell-garden-glow',
    },
    // Lead with the object: the photography showcase sits directly under the hero.
    ...vesselsBlock,
    {
      blockName: 'Scent Quiz',
      blockType: 'scentQuiz',
      headline: SCENT_QUIZ_HEADLINE,
      ...(scentQuizId ? { quiz: scentQuizId } : {}),
      ...(scentQuizFormId ? { formId: scentQuizFormId } : {}),
    },
    {
      blockName: 'Testimonials',
      blockType: 'testimonials',
      items: TESTIMONIALS,
    },
    {
      blockName: 'From the Journal',
      blockType: 'archive',
      categories: [],
      introContent: createRichText([
        createHeading(JOURNAL_HEADING, 'h2'),
        createParagraph(JOURNAL_BODY),
      ]),
      populateBy: 'collection',
      relationTo: 'posts',
      limit: 3,
    },
    {
      blockName: 'Product Archive',
      blockType: 'archive',
      categories: [],
      introContent: createRichText([
        createHeading(COLLECTION_HEADING, 'h2'),
        createParagraph(COLLECTION_BODY),
      ]),
      populateBy: 'collection',
      relationTo: 'products',
      limit: 6,
    },
    {
      blockName: 'Inner Circle CTA',
      blockType: 'innerCircleCTA',
      headline: INNER_CIRCLE_HEADLINE,
      description: INNER_CIRCLE_DESCRIPTION,
    },
  ] as unknown as RequiredDataFromCollectionSlug<'pages'>['layout']

  return {
    slug: 'home',
    _status: 'published',
    title: 'Home',
    hero: { type: 'none' },
    layout,
    meta: {
      title: HOME_META.title,
      description: HOME_META.description,
      ...(heroImageId ? { image: heroImageId } : {}),
    },
  } as RequiredDataFromCollectionSlug<'pages'>
}
