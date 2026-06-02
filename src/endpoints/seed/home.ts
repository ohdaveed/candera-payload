import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type HomeArgs = {
  heroImage: Media
}

const BRAND_NAME = 'Candera Candles'
const TAGLINE = 'Hand-poured botanical candles for the moments that ask you to slow down. Numbered micro-batches, stoneware vessels, two weeks of studio stillness.'
const COLLECTION_HEADING = 'Six vessels. One batch. Your space.'
const COLLECTION_BODY = 'Numbered vessels. Hand-labeled. Cured for two weeks in studio silence. Each candle carries its batch number like a signature.'
const CTA_HEADING = 'Never Miss a Batch'
const CTA_BODY = 'Sellouts happen in days, not weeks. Get first access to every new scent drop plus personal ritual invitations from the studio.'
const META_TITLE = 'Candera Candles | Botanical Scent Studio'
const META_DESCRIPTION = 'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.'

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
      media: heroImage.id,
      richText: createRichText([
        createHeading('Breathe. Before the day takes over.', 'h1'), 
        createParagraph('Hand-poured botanical candles. Numbered micro-batches. Scent as a practice in stilling the noise.')
      ]),
    },
    layout: [
      {
        blockName: 'Storefront Hero',
        blockType: 'storefrontHero',
        heroTag: 'Hand-Poured in the Studio',
        headline: 'Breathe. Before the day takes over.',
        subheading: 'Batch 014 — 50 hours of slow-burn clarity. Cured for two weeks in the studio, ready for your space.',
        media: heroImage.id,
        primaryCtaLabel: 'Claim Your Vessel',
        primaryCtaUrl: '/products',
      } as any,
      {
        blockName: 'Product Archive',
        blockType: 'archive',
        categories: [],
        introContent: createRichText([
          createHeading('Six vessels. One batch. Your space.', 'h2'),
          createParagraph('Numbered vessels. Hand-labeled. Cured for two weeks in studio silence. Each candle carries its batch number like a signature.'),
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