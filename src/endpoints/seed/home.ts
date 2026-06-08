import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media, StorefrontHeroBlock } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
  scentQuizFormId?: string
}

const COLLECTION_HEADING = 'Six vessels. One batch. Your space.'
const COLLECTION_BODY =
  'Numbered vessels. Hand-labeled. Cured for two weeks in studio silence. Each candle carries its batch number like a signature.'
const CTA_HEADING = 'Never Miss a Batch'
const CTA_BODY =
  'Sellouts happen in days, not weeks. Get first access to every new scent drop plus personal ritual invitations from the studio.'
const META_TITLE = 'Candera Candles | Botanical Scent Studio'
const META_DESCRIPTION =
  'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.'

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
        heroTag: 'Hand-Poured in the Studio',
        headline: 'An invitation to slow down.',
        subheading:
          'Limited Release: Batch 014 now curing in the studio. Hand-poured with pressed botanicals.',
        media: heroImage.id,
        primaryCtaLabel: 'Explore the Collection',
        primaryCtaUrl: '/products',
        secondaryCtaLabel: 'Take the Scent Quiz →',
        secondaryCtaUrl: '#scent-quiz',
        showStatusCard: true,
        statusCardTitle: 'Batch 014',
        statusCardSubtitle: '47 units · hand-poured',
        statusCardStatus: 'Curing',
        statusCardShips: '~3 weeks',
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
