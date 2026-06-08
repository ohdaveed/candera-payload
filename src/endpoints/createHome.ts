import type { Endpoint, RequiredDataFromCollectionSlug } from 'payload'
import fs from 'fs'
import path from 'path'
import type { File } from 'payload'
import type { Media } from '@/payload-types'
import { contactForm as contactFormData } from './seed/contact-form'
import { innerCircleForm as innerCircleFormData } from './seed/inner-circle-form'
import { scentQuizForm as scentQuizFormData } from './seed/scent-quiz-form'

const CANDLE_IMAGES = [
  { key: 'seashell-garden', file: 'seashell-garden.jpg' },
  { key: 'meadowlight-botanical', file: 'meadowlight-botanical.jpg' },
  { key: 'crimson-noir', file: 'crimson-noir.jpg' },
  { key: 'ever-after-glow', file: 'ever-after-glow.jpg' },
  { key: 'anyas-eyes', file: 'anyas-eyes.jpg' },
  { key: 'scarlet-bloom', file: 'scarlet-bloom.jpg' },
]

function readLocalImage(filename: string): File | null {
  const filePath = path.join(process.cwd(), 'public', 'candera', filename)
  try {
    const data = fs.readFileSync(filePath)
    return { name: filename, data, mimetype: 'image/jpeg', size: data.byteLength }
  } catch {
    return null
  }
}

const PRODUCT_DATA = [
  {
    title: 'Seashell Garden Glow',
    slug: 'seashell-garden-glow',
    etsyListingId: 1001,
    vessel: '001',
    price: 38,
    productTag: 'Bestseller',
    atmosphere: 'Coastal & Airy',
    burnTime: '50 Hours',
    tagline: 'Gathered from the tide. A practice in coastal stillness.',
    scentProfile: { top: 'Sea Breeze', heart: 'Driftwood', base: 'Salt Air' },
    imageKey: 'seashell-garden',
  },
  {
    title: 'Meadowlight Botanical',
    slug: 'meadowlight-botanical',
    etsyListingId: 1002,
    vessel: '002',
    price: 38,
    productTag: 'New Release',
    atmosphere: 'Fresh & Botanical',
    burnTime: '50 Hours',
    tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
    scentProfile: { top: 'Fresh Green', heart: 'Lily of the Valley', base: 'Morning Dew' },
    imageKey: 'meadowlight-botanical',
  },
  {
    title: 'Crimson Noir',
    slug: 'crimson-noir',
    etsyListingId: 1003,
    vessel: '003',
    price: 38,
    productTag: 'Limited Batch',
    atmosphere: 'Moody & Intimate',
    burnTime: '50 Hours',
    tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
    scentProfile: { top: 'Dark Berry', heart: 'Merlot', base: 'Vetiver' },
    imageKey: 'crimson-noir',
  },
  {
    title: 'Ever After Glow',
    slug: 'ever-after-glow',
    etsyListingId: 1004,
    vessel: '004',
    price: 38,
    productTag: 'Bestseller',
    atmosphere: 'Romantic & Soft',
    burnTime: '50 Hours',
    tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
    scentProfile: { top: 'White Lilac', heart: 'Blue Hydrangea', base: 'Soft Musk' },
    imageKey: 'ever-after-glow',
  },
  {
    title: "Anya's Eyes",
    slug: 'anyas-eyes',
    etsyListingId: 1005,
    vessel: '005',
    price: 38,
    productTag: 'Limited Batch',
    atmosphere: 'Gentle & Contemplative',
    burnTime: '50 Hours',
    tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
    scentProfile: { top: 'Lilac', heart: 'Pressed Pansy', base: 'Soft Powder' },
    imageKey: 'anyas-eyes',
  },
  {
    title: 'Scarlet Bloom',
    slug: 'scarlet-bloom',
    etsyListingId: 1006,
    vessel: '006',
    price: 38,
    productTag: 'New Release',
    atmosphere: 'Bold & Floral',
    burnTime: '50 Hours',
    tagline: 'Botanical architecture. Bold florals grounded in ritual.',
    scentProfile: { top: 'Fresh Florals', heart: 'Botanical Rose', base: 'Green Stem' },
    imageKey: 'scarlet-bloom',
  },
]

export const createHomeEndpoint: Endpoint = {
  path: '/create-home',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = req.payload

    try {
      // Upload candera images as media
      const mediaByKey: Record<string, { id: string | number }> = {}
      for (const { key, file } of CANDLE_IMAGES) {
        // Check if already exists
        const existing = await payload.find({
          collection: 'media',
          where: { filename: { equals: file } },
          limit: 1,
        })
        if (existing.docs.length > 0) {
          mediaByKey[key] = existing.docs[0]
          continue
        }
        const imageFile = readLocalImage(file)
        if (imageFile) {
          try {
            mediaByKey[key] = await payload.create({
              collection: 'media',
              data: { alt: key.replace(/-/g, ' ') },
              file: imageFile,
            })
          } catch {
            // ignore duplicate
          }
        } else {
          payload.logger.warn(`[createHome] Local image file not found: ${file}`)
        }
      }

      // Upsert forms
      const upsertForm = async (formData: typeof contactFormData) => {
        const existing = await payload.find({
          collection: 'forms',
          where: { title: { equals: formData.title } },
          limit: 1,
          depth: 0,
        })
        if (existing.docs.length > 0) {
          return existing.docs[0]
        }
        return payload.create({ collection: 'forms', depth: 0, data: formData })
      }

      const [, , scentQuizFormDoc] = await Promise.all([
        upsertForm(contactFormData),
        upsertForm(innerCircleFormData),
        upsertForm(scentQuizFormData),
      ])

      // Upsert products
      for (const { imageKey, ...product } of PRODUCT_DATA) {
        const existing = await payload.find({
          collection: 'products',
          where: { slug: { equals: product.slug } },
          limit: 1,
        })
        const mediaDoc = mediaByKey[imageKey]
        const data: unknown = {
          ...product,
          ...(mediaDoc ? { extraPhotos: [mediaDoc.id] } : {}),
        }
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'products',
            id: existing.docs[0].id,
            data: data as RequiredDataFromCollectionSlug<'products'>,
          })
        } else {
          await payload.create({
            collection: 'products',
            data: data as RequiredDataFromCollectionSlug<'products'>,
          })
        }
      }

      // Upsert home page
      const heroMedia = mediaByKey['seashell-garden'] as Media | undefined
      if (!heroMedia) {
        return Response.json(
          {
            error:
              'Required hero media "seashell-garden" is missing. Ensure the image exists in public/candera/ and was uploaded successfully.',
          },
          { status: 400 },
        )
      }
      const innerCircleMedia = mediaByKey['crimson-noir'] as Media | undefined
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        limit: 1,
      })

      const pageData: unknown = {
        slug: 'home',
        _status: 'published',
        title: 'Home',
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
            blockType: 'storefrontHero',
            heroTag: 'Hand-Poured in the Studio',
            headline: 'An invitation to slow down.',
            subheading:
              'Limited Release: Batch 014 now curing in the studio. Hand-poured with pressed botanicals.',
            media: heroMedia?.id,
            primaryCtaLabel: 'Explore the Collection',
            primaryCtaUrl: '#collection',
            secondaryCtaLabel: 'Take the Scent Quiz →',
            secondaryCtaUrl: '#scent-quiz',
            showStatusCard: true,
            statusCardTitle: 'Batch 014',
            statusCardSubtitle: '47 units · hand-poured',
            statusCardStatus: 'Curing',
            statusCardShips: '~3 weeks',
          },
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
          },
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
                quote:
                  'A ritual I look forward to every evening. This is the soul of my living room.',
                author: 'Sarah L.',
                location: 'Brooklyn',
                badge: 'Verified Ritualist',
              },
            ],
          },
          {
            blockType: 'scentQuiz',
            eyebrow: 'Find Your Scent',
            headline: 'Which Candera ritual is calling you?',
            formId: scentQuizFormDoc.id.toString(),
          },
          {
            blockType: 'innerCircleCTA',
            headline: 'Never Miss a Batch.',
            description:
              'New batches often sell out within 48 hours. Join to receive 24-hour early access to every limited drop, plus exclusive invitations to our seasonal ritual workshops. No spam, just scent—cancel anytime.',
            ...(innerCircleMedia ? { media: innerCircleMedia.id } : {}),
          },
        ],
        meta: {
          description:
            'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.',
          image: heroMedia?.id,
          title: 'Candera Candles | Botanical Scent Studio',
        },
      }

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: pageData as RequiredDataFromCollectionSlug<'pages'>,
          context: { disableRevalidate: true },
        })
      } else {
        await payload.create({
          collection: 'pages',
          data: pageData as RequiredDataFromCollectionSlug<'pages'>,
          context: { disableRevalidate: true },
        })
      }

      return Response.json({ success: true, message: 'Home page and products created/updated.' })
    } catch (error: unknown) {
      payload.logger.error({ err: error, msg: 'Error in /create-home endpoint' })
      return Response.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      )
    }
  },
}
