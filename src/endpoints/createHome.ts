import type { Endpoint, RequiredDataFromCollectionSlug } from 'payload'
import fs from 'fs'
import path from 'path'
import type { File } from 'payload'
import type { Media } from '@/payload-types'
import { contactForm as contactFormData } from './seed/contact-form'
import { innerCircleForm as innerCircleFormData } from './seed/inner-circle-form'
import { scentQuizForm as scentQuizFormData } from './seed/scent-quiz-form'
import { home } from './seed/home'

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
    atmosphereSlug: 'coastal',
    burnTime: '60 Hours',
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
    atmosphereSlug: 'fresh',
    burnTime: '60 Hours',
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
    atmosphereSlug: 'moody',
    burnTime: '60 Hours',
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
    atmosphereSlug: 'romantic',
    burnTime: '60 Hours',
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
    atmosphereSlug: 'contemplative',
    burnTime: '60 Hours',
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
    atmosphereSlug: 'bold',
    burnTime: '60 Hours',
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

      // Upsert products. `atmosphere` is a relationship to scent-profiles,
      // so it can't be set from the inline string data here — we strip the
      // atmosphereSlug from the create/update payload and link it in a
      // second pass below, mirroring the canonical full seed.
      const productLinks: { id: string | number; atmosphereSlug: string }[] = []
      for (const { imageKey, atmosphereSlug, ...product } of PRODUCT_DATA) {
        const existing = await payload.find({
          collection: 'products',
          where: { slug: { equals: product.slug } },
          limit: 1,
        })
        const mediaDoc = mediaByKey[imageKey]
        const data: unknown = {
          ...product,
          // Products default to draft; publish them (as the full seed does) so
          // the public archives — which now fetch with overrideAccess: false —
          // can actually show the products this endpoint just upserted.
          _status: 'published',
          ...(mediaDoc ? { extraPhotos: [mediaDoc.id] } : {}),
        }
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'products',
            id: existing.docs[0].id,
            data: data as RequiredDataFromCollectionSlug<'products'>,
          })
          productLinks.push({ id: existing.docs[0].id, atmosphereSlug })
        } else {
          const created = await payload.create({
            collection: 'products',
            data: data as RequiredDataFromCollectionSlug<'products'>,
          })
          productLinks.push({ id: created.id, atmosphereSlug })
        }
      }

      // Second pass: link each product to its atmosphere (scent-profile) by
      // slug, but only if that profile already exists in the database. This
      // endpoint does not seed scent-profiles, so a missing profile is simply
      // skipped rather than failing the whole request.
      for (const { id, atmosphereSlug } of productLinks) {
        const profile = await payload.find({
          collection: 'scent-profiles',
          where: { slug: { equals: atmosphereSlug } },
          limit: 1,
          depth: 0,
        })
        const atmosphereId = profile.docs[0]?.id
        if (!atmosphereId) continue
        await payload.update({
          collection: 'products',
          id,
          data: {
            atmosphere: atmosphereId,
          } as unknown as RequiredDataFromCollectionSlug<'products'>,
        })
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
      // The Scent Quiz block requires a relationship to a quizzes doc. This
      // endpoint doesn't seed quizzes (seedScentQuiz is not idempotent), so we
      // reuse the quiz created by the full seed. If none exists yet, fail with
      // a clear message rather than writing an invalid layout.
      const quiz = await payload.find({
        collection: 'quizzes',
        where: { title: { equals: 'Candera Scent Ritual Quiz' } },
        limit: 1,
        depth: 0,
      })
      // The Scent Quiz block requires a relationship to a quizzes doc. This
      // endpoint doesn't seed quizzes (seedScentQuiz is not idempotent), so it
      // reuses the quiz created by the full seed when present. If none exists
      // yet, we drop the quiz block below rather than failing — this keeps
      // create-home usable to provision/repair a database that hasn't run the
      // full seed, instead of 400-ing after media/forms/products were written.
      const scentQuizId = quiz.docs[0]?.id

      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        limit: 1,
      })

      // Single source of truth: reuse the same layout the full seed uses
      // (src/endpoints/seed/home.ts) so this targeted upsert can never drift
      // from the canonical home design. The three vessel photos and the hero
      // share the candera media set uploaded above.
      const vesselImages = (['meadowlight-botanical', 'crimson-noir', 'ever-after-glow'] as const)
        .map((key) => mediaByKey[key] as Media | undefined)
        .filter((m): m is Media => Boolean(m))

      const pageData = home({
        heroImage: heroMedia,
        vesselImages,
        scentQuizFormId: scentQuizFormDoc.id,
        scentQuizId,
      })

      // Without a quiz the Scent Quiz block's required `quiz` relationship
      // can't be satisfied, so omit that one block; the rest of the home page
      // still upserts cleanly. Re-running after a quiz exists restores it.
      if (!scentQuizId) {
        pageData.layout = (pageData.layout ?? []).filter((block) => block.blockType !== 'scentQuiz')
        // The hero's secondary CTA points at the now-removed #scent-quiz
        // anchor; clear it so the page doesn't show a dead "Take the Scent
        // Quiz" button (the hero only renders it when label + url are both set).
        for (const block of pageData.layout) {
          if (block.blockType === 'storefrontHero') {
            const hero = block as {
              secondaryCtaLabel?: string | null
              secondaryCtaUrl?: string | null
            }
            hero.secondaryCtaLabel = null
            hero.secondaryCtaUrl = null
          }
        }
      }

      // Unlike the full `yarn seed` (which runs without a Next server and so
      // must set disableRevalidate), this endpoint runs inside the live app.
      // Leaving revalidation on lets the Pages afterChange hook bust the `/`
      // route cache, so the new home layout shows up without a redeploy.
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: pageData as RequiredDataFromCollectionSlug<'pages'>,
        })
      } else {
        await payload.create({
          collection: 'pages',
          data: pageData as RequiredDataFromCollectionSlug<'pages'>,
        })
      }

      return Response.json({
        success: true,
        message: scentQuizId
          ? 'Home page and products created/updated.'
          : 'Home page and products created/updated. Scent Quiz block skipped (no quiz found — run the full seed to add it).',
      })
    } catch (error: unknown) {
      payload.logger.error({ err: error, msg: 'Error in /create-home endpoint' })
      return Response.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      )
    }
  },
}
