import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

type HomeArgs = {
  heroImage: Media
  metaImage: Media
  innerCircleImage?: Media
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage: _metaImage,
  innerCircleImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'none',
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [],
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
    layout: [
      {
        blockName: 'Storefront Hero',
        blockType: 'storefrontHero',
        heroTag: 'Hand-Poured in the Studio',
        headline: 'An invitation to slow down.',
        subheading: 'Limited Release: Batch 014 now curing in the studio.',
        media: heroImage.id,
        primaryCtaLabel: 'Explore the Collection',
        primaryCtaUrl: '#collection',
      } as any,
      {
        blockName: 'Product Archive',
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
                    text: 'Rooted in Earth, Released in Air.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h2',
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
                    text: 'Each vessel is part of a numbered micro-batch, hand-labeled and inspected for peak botanical clarity.',
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
      },
      {
        blockName: 'Testimonials',
        blockType: 'testimonials',
        eyebrow: 'Voices of the Inner Circle',
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
        blockName: 'Inner Circle CTA',
        blockType: 'innerCircleCTA',
        headline: 'Join the Inner Circle',
        description:
          'Our batches often sell out in days. Join our list to receive early access to new scent drops and personal ritual invitations.',
        ctaLabel: 'Request Entry',
        ctaUrl: '/inner-circle',
        ...(innerCircleImage ? { media: innerCircleImage.id } : {}),
      } as any,
    ],
    meta: {
      description:
        'Cultivating intentional living through scent and micro-batch artisanry. Hand-poured in the studio.',
      image: heroImage.id,
      title: 'Candera — An invitation to slow down.',
    },
    title: 'Home',
  }
}
