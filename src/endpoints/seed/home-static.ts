import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'none',
  },
  meta: {
    description:
      'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.',
    title: 'Candera Candles | Botanical Scent Studio',
  },
  title: 'Home',
  layout: [
    {
      blockType: 'storefrontHero',
      heroTag: 'Hand-Poured in the Studio',
      headline: 'An invitation to slow down.',
      subheading:
        'Limited Release: Batch 014 now curing in the studio. Hand-poured with pressed botanicals.',
      primaryCtaLabel: 'Explore the Collection',
      primaryCtaUrl: '#collection',
      secondaryCtaLabel: 'Take the Scent Quiz →',
      secondaryCtaUrl: '#scent-quiz',
      showStatusCard: true,
      statusCardTitle: 'Batch 014',
      statusCardSubtitle: '47 units · hand-poured',
      statusCardStatus: 'Curing',
      statusCardShips: '~3 weeks',
    } as any,

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
                  text: 'Six vessels. One numbered batch. Your sanctuary.',
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
                  text: 'Numbered vessels. Hand-labeled. Cured for two weeks in studio silence. Each candle carries its batch number like a signature.',
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
    } as any,
    {
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
    } as any,
    {
      blockType: 'innerCircleCTA',
      headline: 'Never Miss a Batch.',
      description:
        'New batches often sell out within 48 hours. Join to receive 24-hour early access to every limited drop, plus exclusive invitations to our seasonal ritual workshops. No spam, just scent—cancel anytime.',
      ctaLabel: 'Get Early Access',
    } as any,
  ],
}
