import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
}

const BRAND_NAME = 'Candera Candles'
const TAGLINE = 'Handcrafted luxury candles for your home. Experience the essence of tranquility with our signature scents.'
const COLLECTION_HEADING = 'Rooted in Earth, Released in Air.'
const COLLECTION_BODY = 'Each vessel is part of a numbered micro-batch, hand-labeled and inspected for peak botanical clarity.'
const CTA_HEADING = 'An Invitation to the Ritual'
const CTA_BODY = 'Discover the scent that speaks to your space. Take our curated scent quiz for a personalized sensory recommendation.'
const META_TITLE = 'Candera Candles | Luxury Botanical Studio'
const META_DESCRIPTION = 'Hand-poured luxury botanical candles. Cultivating intentional living through scent.'

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Explore the Collection',
            url: '/products',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Our Story',
            url: '/posts',
          },
        },
      ],
      media: heroImage.id,
      richText: createRichText([
        createHeading('An invitation to slow down.', 'h1'), 
        createParagraph('Hand-poured luxury botanical candles. Cultivating intentional living through scent and micro-batch artisanry.')
      ]),
    },
    layout: [
      {
        blockName: 'Storefront Hero',
        blockType: 'storefrontHero',
        heroTag: 'Hand-Poured in the Studio',
        headline: 'A Practice in Stillness.',
        subheading: 'Limited Release: Batch 014 now curing in the studio.',
        media: heroImage.id,
        primaryCtaLabel: 'Shop the Batch',
        primaryCtaUrl: '/products',
      } as any,
      {
        blockName: 'Product Archive',
        blockType: 'archive',
        categories: [],
        introContent: createRichText([
          createHeading('The Current Batch.', 'h2'),
          createParagraph('Each vessel is part of a numbered micro-batch, hand-labeled and inspected for peak botanical clarity. Cured for two weeks in the studio stillness.'),
        ]),
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
        richText: createRichText([
          createHeading(CTA_HEADING, 'h3'),
          createParagraph(CTA_BODY),
        ]),
      },
    ],
    meta: {
      description: META_DESCRIPTION,
      image: heroImage.id,
      title: META_TITLE,
    },
    title: 'Home',
  }
}