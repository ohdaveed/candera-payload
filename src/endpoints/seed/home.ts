import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
}

const BRAND_NAME = 'Candera Candles'
const TAGLINE = 'Handcrafted luxury candles for your home. Experience the essence of tranquility with our signature scents.'
const COLLECTION_HEADING = 'Our Collection'
const COLLECTION_BODY = 'Explore our range of artisanal candles, each designed to create a unique atmosphere in your space.'
const CTA_HEADING = 'Find Your Perfect Scent'
const CTA_BODY = 'Need help choosing? Contact us for personalized recommendations.'
const META_TITLE = 'Candera Candles'
const META_DESCRIPTION = 'Handcrafted luxury candles for your home.'

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
            label: 'Shop All',
            url: '/products',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Contact',
            url: '/contact',
          },
        },
      ],
      media: heroImage.id,
      richText: createRichText([createHeading(BRAND_NAME, 'h1'), createParagraph(TAGLINE)]),
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
        introContent: createRichText([
          createHeading(COLLECTION_HEADING, 'h3'),
          createParagraph(COLLECTION_BODY),
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