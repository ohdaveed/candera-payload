import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media, StorefrontHeroBlock } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
  scentQuizFormId?: string | number
  scentQuizId?: string | number
}

const COLLECTION_HEADING = 'Not manufactured. Made.'
const COLLECTION_BODY =
  "Every Candera candle is designed, poured, decorated, and finished by hand — by Olesia, the founder and the only maker. The flowers are real. The herbs are real. No two are exactly alike. That's not a limitation — it's the point."
const CTA_HEADING = 'Join the Inner Circle'
const CTA_BODY =
  'New batches are made by hand, one at a time. Join to receive early access before each drop opens to the public.'
const META_TITLE = 'Candera Candles | Handmade Botanical Candles'
const META_DESCRIPTION =
  'Handcrafted botanical candles made by one maker, one at a time. Real flowers, natural wax, clean burn — designed to bring a little more light and intention into your home.'

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  scentQuizFormId,
  scentQuizId,
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
        heroTag: 'Handmade by Olesia',
        headline: 'Made to make you stop.',
        subheading:
          'Small-batch candles crafted with real botanicals and natural wax — made by one maker, one at a time, for the quiet moments that belong entirely to you.',
        media: heroImage.id,
        primaryCtaLabel: 'Explore the Collection',
        primaryCtaUrl: '/products',
        secondaryCtaLabel: 'Take the Scent Quiz →',
        secondaryCtaUrl: '#scent-quiz',
        showStatusCard: false,
        statusCardTitle: 'Studio Status',
        statusCardSubtitle: 'Hand-pouring series 01',
        statusCardStatus: 'In Progress',
        statusCardShips: 'Coming Soon',
      } satisfies StorefrontHeroBlock & { blockType: 'storefrontHero'; blockName?: string },
      {
        blockName: 'Scent Quiz',
        blockType: 'scentQuiz',
        eyebrow: 'Find Your Scent',
        headline: 'Not sure where to start?',
        quiz: scentQuizId,
        formId: scentQuizFormId,
      } as unknown as RequiredDataFromCollectionSlug<'pages'>['layout'][0],
      {
        blockName: 'Product Archive',
        blockType: 'archive',
        categories: [],
        introContent: createRichText([
          createHeading(COLLECTION_HEADING, 'h2'),
          createParagraph(COLLECTION_BODY),
        ]),
        populateBy: 'collection',
        relationTo: 'posts',
        limit: 6,
      },
      {
        blockName: 'Testimonials',
        blockType: 'testimonials',
        eyebrow: 'From Our Community',
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
        blockName: 'Inner Circle CTA',
        blockType: 'innerCircleCTA',
        headline: 'Your space deserves this.',
        description:
          "When you light a Candera candle, Olesia's hope is that you feel more than fragrance. She hopes you feel comfort. She hopes you feel present. Join the Inner Circle for early access to every new batch — made by hand, one at a time.",
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
