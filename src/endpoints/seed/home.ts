import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media, StorefrontHeroBlock } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
  vesselImages?: Media[]
  scentQuizFormId?: string | number
  scentQuizId?: string | number
}

const COLLECTION_HEADING = 'Not manufactured. Made.'
const COLLECTION_BODY =
  "Every Candera candle is designed, poured, decorated, and finished by hand — by Olesia, the founder and the only maker. The flowers are real. The herbs are real. No two are exactly alike. That's not a limitation — it's the point."
const CTA_HEADING = 'Join the Inner Circle'
const CTA_BODY =
  'Batches are poured by hand, one at a time, and often sell out in days. Join for early access before each drop opens to the public.'
const JOURNAL_HEADING = 'From the Journal'
const JOURNAL_BODY =
  'Field notes from the studio — the science, the botanicals, and the craft behind every pour, from the only maker who pours them.'
const META_TITLE = 'Candera Candles | Handmade Botanical Candles'
const META_DESCRIPTION =
  'Handcrafted botanical candles made by one maker, one at a time. Real flowers, natural wax, clean burn — designed to bring a little more light and intention into your home.'

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  vesselImages = [],
  scentQuizFormId,
  scentQuizId,
}) => {
  const vesselImage = (i: number): number | string =>
    (typeof vesselImages[i] === 'object' ? vesselImages[i]?.id : vesselImages[i]) ?? heroImage.id
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [
      {
        blockName: 'Storefront Hero',
        blockType: 'storefrontHero',
        heroTag: 'Handmade by Olesia',
        headline: 'Candles made to make you stop.',
        subheading:
          'Small-batch candles crafted with real botanicals and natural wax — made by one maker, one at a time, for the quiet moments that belong entirely to you.',
        media: heroImage.id,
        primaryCtaLabel: 'Shop the Collection',
        primaryCtaUrl: '/products',
        secondaryCtaLabel: 'Take the Scent Quiz →',
        secondaryCtaUrl: '#scent-quiz',
        showStatusCard: true,
        statusCardTitle: 'Current Pour',
        statusCardSubtitle: 'Series 01 · Batch of 50',
        statusCardStatus: 'Now Pouring',
        statusCardShips: 'Ships in 3–5 days',
        statusCardLinkUrl: '/products/seashell-garden-glow',
      } satisfies StorefrontHeroBlock & { blockType: 'storefrontHero'; blockName?: string },
      {
        // The Vessels — a hyper-minimalist photography showcase placed
        // directly under the hero so the texture lands before the reading.
        blockName: 'The Vessels',
        blockType: 'theVessels',
        eyebrow: 'The Vessels',
        heading: 'Unlit. Unhurried.',
        items: [
          {
            image: vesselImage(0),
            label: 'Vessel 001',
            caption: 'Hand-finished stoneware',
          },
          {
            image: vesselImage(1),
            label: 'Vessel 002',
            caption: 'Pressed botanicals, set by hand',
          },
          {
            image: vesselImage(2),
            label: 'Vessel 003',
            caption: 'Natural wax, slow-cured',
          },
        ],
      } as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'][0],
      {
        blockName: 'Testimonials',
        blockType: 'testimonials',
        items: [
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
        ],
        richText: createRichText([createHeading(CTA_HEADING, 'h3'), createParagraph(CTA_BODY)]),
      },
      {
        // Journal — moved below the testimonials so Olesia teaches the
        // chemistry of the burn last, after the object and the social proof.
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
        blockName: 'Scent Quiz',
        blockType: 'scentQuiz',
        headline: 'Not sure where to start?',
        quiz: scentQuizId,
        formId: scentQuizFormId,
      } as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'][0],
      {
        blockName: 'Inner Circle CTA',
        blockType: 'innerCircleCTA',
        headline: 'Be first to every new batch.',
        description:
          'Batches are poured by hand, one at a time, and often sell out in days. Join the Inner Circle for early access before each drop — plus studio notes from Olesia as every candle comes to life.',
      } as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'][0],
    ],
    meta: {
      description: META_DESCRIPTION,
      image: heroImage.id,
      title: META_TITLE,
    },
    title: 'Home',
  }
}
