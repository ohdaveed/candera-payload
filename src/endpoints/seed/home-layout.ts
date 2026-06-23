import type { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

/**
 * Single source of truth for the homepage content + structure.
 *
 * Previously the homepage was defined three times (seed/home.ts, the static
 * fallback in seed/home-static.ts, and the now-removed /create-home endpoint),
 * which drifted apart. Both remaining definitions build from here:
 *  - seed/home.ts        → buildHomePage({ heroImageId, scentQuizFormId, scentQuizId })
 *  - seed/home-static.ts → buildHomePage()  (no media/quiz; used as the fallback)
 *
 * Canonical design matches the live page: hero → archive → testimonials →
 * scentQuiz → innerCircleCTA, status card shown, primary CTA → /products.
 */

// ── Copy ──────────────────────────────────────────────────────────────────────
const HERO_TAG = 'Handmade by Olesia'
const HERO_HEADLINE = 'Candles made to make you stop.'
const HERO_SUBHEADING =
  'Small-batch candles crafted with real botanicals and natural wax — made by one maker, one at a time, for the quiet moments that belong entirely to you.'

const COLLECTION_HEADING = 'Not manufactured. Made.'
const COLLECTION_BODY =
  "Every Candera candle is designed, poured, decorated, and finished by hand — by Olesia, the founder and the only maker. The flowers are real. The herbs are real. No two are exactly alike. That's not a limitation — it's the point."

const SCENT_QUIZ_HEADLINE = 'Not sure where to start?'

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
  scentQuizFormId?: string | number
  scentQuizId?: string | number
}

export function buildHomePage(args: BuildHomeArgs = {}): RequiredDataFromCollectionSlug<'pages'> {
  const { heroImageId, scentQuizFormId, scentQuizId } = args

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
      statusCardTitle: 'Batch 014',
      statusCardSubtitle: '47 units · hand-poured',
      statusCardStatus: 'Curing',
      statusCardShips: '~3 weeks',
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
      blockName: 'Testimonials',
      blockType: 'testimonials',
      items: TESTIMONIALS,
    },
    {
      blockName: 'Scent Quiz',
      blockType: 'scentQuiz',
      headline: SCENT_QUIZ_HEADLINE,
      ...(scentQuizId ? { quiz: scentQuizId } : {}),
      ...(scentQuizFormId ? { formId: scentQuizFormId } : {}),
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
