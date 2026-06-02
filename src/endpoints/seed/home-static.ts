import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'highImpact',
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'Shop the Batch',
          url: '/products',
        },
      },
      {
        link: {
          type: 'custom',
          appearance: 'outline',
          label: 'The Studio',
          url: '/posts',
        },
      },
    ],
    richText: {
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
                text: 'Breathe. Before the day takes over.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
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
                text: 'Hand-poured botanical candles. Numbered micro-batches. Scent as a practice in stilling the noise.',
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
  },
  meta: {
    description: 'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.',
    title: 'Candera Candles | Botanical Scent Studio',
  },
  title: 'Home',
  layout: [
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
                  text: 'Six vessels. One batch. Your space.',
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
      blockType: 'innerCircleCTA',
      headline: 'Never Miss a Batch.',
      description: 'Sellouts happen in days, not weeks. Get first access to every new scent drop plus personal ritual invitations from the studio.',
      ctaLabel: 'Get Early Access',
    } as any,
  ],
}
