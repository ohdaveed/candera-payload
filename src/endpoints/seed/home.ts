import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media, StorefrontHeroBlock } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
  scentQuizFormId?: string
}

const COLLECTION_HEADING = 'Crafted in the Studio.'
const COLLECTION_BODY =
  'Hand-poured botanical candles, curated for scent and stillness. Each piece is hand-labeled and cured in studio silence.'
const CTA_HEADING = 'Join the Inner Circle'
const CTA_BODY =
  'Be the first to hear about new arrivals, studio updates, and seasonal ritual invitations.'
const META_TITLE = 'Candera Candles | Botanical Scent Studio'
const META_DESCRIPTION =
  'Hand-poured botanical candles crafted with intent. Scent, stillness, and ritual objects for your daily practice.'

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  scentQuizFormId = '',
}) => {
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
        heroTag: 'Botanical Scent Studio',
        headline: 'Anchor your space with sixty hours of intention and botanical stillness.',
        subheading: 'Botanical candles crafted with intent. Now preparing our first studio series.',
        media: heroImage.id,
        primaryCtaLabel: 'Explore the Collection',
        primaryCtaUrl: '/products',
        secondaryCtaLabel: 'Take the Scent Quiz →',
        secondaryCtaUrl: '#scent-quiz',
        showStatusCard: true,
        statusCardTitle: 'Studio Status',
        statusCardSubtitle: 'Hand-pouring series 01',
        statusCardStatus: 'In Progress',
        statusCardShips: 'Coming Soon',
      } satisfies StorefrontHeroBlock & { blockType: 'storefrontHero'; blockName?: string },
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
        eyebrow: 'From Our Ritualists',
        items: [
          {
            quote:
              'The scent profile is unlike anything mass-produced. It fills the room without overwhelming the senses.',
            author: 'Elena R.',
            location: 'Los Angeles',
            badge: 'Verified Ritualist',
          },
          {
            quote:
              'I reuse the stoneware vessels for my succulents. They are truly objects of art, even after the burn.',
            author: 'James T.',
            location: 'Austin',
            badge: 'Repeat Collector',
          },
          {
            quote: 'A ritual I look forward to every evening. This is the soul of my living room.',
            author: 'Sarah L.',
            location: 'Brooklyn',
            badge: 'Verified Ritualist',
          },
        ],
        richText: createRichText([createHeading(CTA_HEADING, 'h3'), createParagraph(CTA_BODY)]),
      },
      {
        blockName: 'Scent Quiz',
        blockType: 'scentQuiz',
        eyebrow: 'Find Your Scent',
        headline: 'Which Candera ritual is calling you?',
        formId: scentQuizFormId,
      } as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'][0],
      {
        blockName: 'Inner Circle CTA',
        blockType: 'innerCircleCTA',
        headline: 'Never Miss a Batch.',
        description:
          'New batches often sell out within 48 hours. Join to receive 24-hour early access to every limited drop, plus exclusive invitations to our seasonal ritual workshops. No spam, just scent—cancel anytime.',
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
