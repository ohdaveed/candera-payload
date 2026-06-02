import type { Endpoint } from 'payload'
import fs from 'fs'
import path from 'path'
import type { File } from 'payload'

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
    title: 'Seashell Garden Glow', slug: 'seashell-garden-glow', etsyListingId: 1001,
    vessel: '001', price: 38, productTag: 'Bestseller', atmosphere: 'Coastal & Airy',
    burnTime: '50 Hours',
    tagline: 'Gathered from the tide. A practice in coastal stillness.',
    scentProfile: { top: 'Sea Breeze', heart: 'Driftwood', base: 'Salt Air' },
    imageKey: 'seashell-garden',
  },
  {
    title: 'Meadowlight Botanical', slug: 'meadowlight-botanical', etsyListingId: 1002,
    vessel: '002', price: 38, productTag: 'New Release', atmosphere: 'Fresh & Botanical',
    burnTime: '50 Hours',
    tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
    scentProfile: { top: 'Fresh Green', heart: 'Lily of the Valley', base: 'Morning Dew' },
    imageKey: 'meadowlight-botanical',
  },
  {
    title: 'Crimson Noir', slug: 'crimson-noir', etsyListingId: 1003,
    vessel: '003', price: 38, productTag: 'Limited Batch', atmosphere: 'Moody & Intimate',
    burnTime: '50 Hours',
    tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
    scentProfile: { top: 'Dark Berry', heart: 'Merlot', base: 'Vetiver' },
    imageKey: 'crimson-noir',
  },
  {
    title: 'Ever After Glow', slug: 'ever-after-glow', etsyListingId: 1004,
    vessel: '004', price: 38, productTag: 'Bestseller', atmosphere: 'Romantic & Soft',
    burnTime: '50 Hours',
    tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
    scentProfile: { top: 'White Lilac', heart: 'Blue Hydrangea', base: 'Soft Musk' },
    imageKey: 'ever-after-glow',
  },
  {
    title: "Anya's Eyes", slug: 'anyas-eyes', etsyListingId: 1005,
    vessel: '005', price: 38, productTag: 'Limited Batch', atmosphere: 'Gentle & Contemplative',
    burnTime: '50 Hours',
    tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
    scentProfile: { top: 'Lilac', heart: 'Pressed Pansy', base: 'Soft Powder' },
    imageKey: 'anyas-eyes',
  },
  {
    title: 'Scarlet Bloom', slug: 'scarlet-bloom', etsyListingId: 1006,
    vessel: '006', price: 38, productTag: 'New Release', atmosphere: 'Bold & Floral',
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
          } catch (_e) {
            // ignore duplicate
          }
        } else {
          payload.logger.warn(`[createHome] Local image file not found: ${file}`)
        }
      }


      // Upsert products
      for (const { imageKey, ...product } of PRODUCT_DATA) {
        const existing = await payload.find({
          collection: 'products',
          where: { slug: { equals: product.slug } },
          limit: 1,
        })
        const mediaDoc = mediaByKey[imageKey]
        const data: any = {
          ...product,
          ...(mediaDoc ? { extraPhotos: [mediaDoc.id] } : {}),
        }
        if (existing.docs.length > 0) {
          await payload.update({ collection: 'products', id: existing.docs[0].id, data })
        } else {
          await payload.create({ collection: 'products', data })
        }
      }

      // Upsert home page
      const heroMedia = mediaByKey['seashell-garden']
      if (!heroMedia) {
        return Response.json(
          { error: 'Required hero media "seashell-garden" is missing. Ensure the image exists in public/candera/ and was uploaded successfully.' },
          { status: 400 },
        )
      }
      const innerCircleMedia = mediaByKey['crimson-noir']
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        limit: 1,
      })

      const pageData: any = {
        slug: 'home',
        _status: 'published',
        title: 'Home',
        hero: {
          type: 'none',
          richText: { root: { type: 'root', children: [{ type: 'paragraph', children: [], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 } },
        },
        layout: [
          {
            blockType: 'storefrontHero',
            heroTag: 'Hand-Poured in the Studio',
            headline: 'Breathe. Before the day takes over.',
            subheading: 'Batch 014 — 50 hours of slow-burn clarity. Cured for two weeks in the studio, ready for your space.',
            media: heroMedia?.id,
            primaryCtaLabel: 'Claim Your Vessel',
            primaryCtaUrl: '#collection',
          },
          {
            blockType: 'archive',
            categories: [],
            introContent: {
              root: { type: 'root', children: [{ type: 'heading', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Six vessels. One batch. Your space.', version: 1 }], direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1 }, { type: 'paragraph', children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Numbered vessels. Hand-labeled. Cured for two weeks in studio silence. Each candle carries its batch number like a signature.', version: 1 }], direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 }], direction: 'ltr', format: '', indent: 0, version: 1 },
            },
            populateBy: 'collection',
            relationTo: 'products',
            limit: 6,
          },
          {
            blockType: 'testimonials',
            eyebrow: 'From Our Ritualists',
            items: [
              { quote: 'The scent profile is unlike anything mass-produced. It fills the room without overwhelming the senses.', author: 'Elena R.', location: 'Los Angeles', badge: 'Verified Ritualist' },
              { quote: 'I reuse the stoneware vessels for my succulents. They are truly objects of art, even after the burn.', author: 'James T.', location: 'Austin', badge: 'Repeat Collector' },
              { quote: 'A ritual I look forward to every evening. This is the soul of my living room.', author: 'Sarah L.', location: 'Brooklyn', badge: 'Verified Ritualist' },
            ],
          },
          {
            blockType: 'innerCircleCTA',
            headline: 'Never Miss a Batch',
            description: 'Sellouts happen in days, not weeks. Get first access to every new scent drop plus personal ritual invitations from the studio.',
            ctaLabel: 'Get Early Access',
            ctaUrl: '/#collection',
            ...(innerCircleMedia ? { media: innerCircleMedia.id } : {}),
          },
        ],
        meta: {
          description: 'Hand-poured botanical candles crafted in numbered micro-batches. Scent, stillness, and ritual objects for your daily practice.',
          image: heroMedia?.id,
          title: 'Candera Candles | Botanical Scent Studio',
        },
      }

      if (existing.docs.length > 0) {
        await payload.update({ collection: 'pages', id: existing.docs[0].id, data: pageData, context: { disableRevalidate: true } })
      } else {
        await payload.create({ collection: 'pages', data: pageData, context: { disableRevalidate: true } })
      }

      return Response.json({ success: true, message: 'Home page and products created/updated.' })
    } catch (error: any) {
      payload.logger.error({ err: error, msg: 'Error in /create-home endpoint' })
      return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 })
    }
  },
}
