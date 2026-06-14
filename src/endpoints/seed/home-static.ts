import type { RequiredDataFromCollectionSlug } from 'payload'
import type {
  StorefrontHeroBlock,
  ArchiveBlock,
  TestimonialsBlock,
  InnerCircleCTABlock,
  ScentQuizBlock,
} from '@/payload-types'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'none',
  },
  meta: {
    description:
      'Handcrafted botanical candles made by one maker, one at a time. Real flowers, natural wax, clean burn — designed to bring a little more light and intention into your home.',
    title: 'Candera Candles | Handmade Botanical Candles',
  },
  title: 'Home',
  layout: [
    {
      blockType: 'storefrontHero',
      heroTag: 'Handmade by Olesia',
      headline: 'Made to make you stop.',
      subheading:
        'Small-batch candles crafted with real botanicals and natural wax — made by one maker, one at a time, for the quiet moments that belong entirely to you.',
      primaryCtaLabel: 'Explore the Collection',
      primaryCtaUrl: '#collection',
      secondaryCtaLabel: 'Take the Scent Quiz →',
      secondaryCtaUrl: '#scent-quiz',
      showStatusCard: true,
      statusCardTitle: 'Batch 014',
      statusCardSubtitle: '47 units · hand-poured',
      statusCardStatus: 'Curing',
      statusCardShips: '~3 weeks',
    } as unknown as StorefrontHeroBlock,

    {
      blockType: 'archive',
      categories: [],
      introContent: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Not manufactured. Made.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h3',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "Every Candera candle is designed, poured, decorated, and finished by hand — by Olesia, the founder and the only maker. The flowers are real. The herbs are real. No two are exactly alike. That's not a limitation — it's the point.",
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      populateBy: 'collection',
      relationTo: 'products',
      limit: 6,
    } as unknown as ArchiveBlock,
    {
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
    } as unknown as TestimonialsBlock,
    {
      blockType: 'scentQuiz',
      eyebrow: 'Find Your Scent',
      headline: 'Not sure where to start?',
      formId: '',
    } as unknown as ScentQuizBlock,
    {
      blockType: 'innerCircleCTA',
      headline: 'Your space deserves this.',
      description:
        "When you light a Candera candle, Olesia's hope is that you feel more than fragrance. She hopes you feel comfort. She hopes you feel present. Join the Inner Circle for early access to every new batch — made by hand, one at a time.",
    } as unknown as InnerCircleCTABlock,
  ],
}
