import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Idempotent, in-place fix for demo product data — does NOT touch users or any
 * other collection (unlike a full re-seed). Safe to run repeatedly.
 *
 * For each demo product (matched by slug) it:
 *   1. sets the correct Etsy listing id (a real CanderaCandles listing, or null
 *      so the storefront falls back to the shop link), and
 *   2. attaches the bundled /public/candera image *only if* the product has no
 *      photos yet (never clobbers existing images).
 *
 * Run with:  pnpm fix:product-listings
 */

// Load .env.local like the other data scripts (scripts/sync-etsy.ts).
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local'), override: true })

type ProductFix = {
  slug: string
  /** Real CanderaCandles listing id, or null to fall back to the shop URL. */
  etsyListingId: number | null
  /** Bundled image basename in /public/candera (.jpg). */
  imageKey: string
}

// The 3 real listing ids are the verified CanderaCandles listings (see scripts/sync-etsy.ts).
const PRODUCT_FIXES: ProductFix[] = [
  { slug: 'seashell-garden-glow', etsyListingId: 1717226844, imageKey: 'seashell-garden' },
  { slug: 'meadowlight-botanical', etsyListingId: 1731408433, imageKey: 'meadowlight-botanical' },
  { slug: 'crimson-noir', etsyListingId: 1731418441, imageKey: 'crimson-noir' },
  { slug: 'ever-after-glow', etsyListingId: null, imageKey: 'ever-after-glow' },
  { slug: 'anyas-eyes', etsyListingId: null, imageKey: 'anyas-eyes' },
  { slug: 'scarlet-bloom', etsyListingId: null, imageKey: 'scarlet-bloom' },
]

function loadCandleraImage(imageKey: string) {
  const filePath = path.join(process.cwd(), 'public', 'candera', `${imageKey}.jpg`)
  const data = fs.readFileSync(filePath)
  return { name: `${imageKey}.jpg`, data, mimetype: 'image/jpeg', size: data.byteLength }
}

async function run(): Promise<void> {
  const payload = await getPayload({ config })
  let updatedCount = 0

  for (const fix of PRODUCT_FIXES) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: fix.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const product = docs[0]
    if (!product) {
      payload.logger.warn(`fix-product-listings: no product with slug "${fix.slug}" — skipping`)
      continue
    }

    const data: { etsyListingId?: number | null; extraPhotos?: number[] } = {}

    // 1) Etsy listing id — only write when it differs (keeps the run idempotent).
    const currentId = product.etsyListingId ?? null
    if (currentId !== fix.etsyListingId) {
      data.etsyListingId = fix.etsyListingId
    }

    // 2) Image — attach the bundled photo only when the product has none.
    const hasPhotos = Array.isArray(product.extraPhotos) && product.extraPhotos.length > 0
    if (!hasPhotos) {
      try {
        const media = await payload.create({
          collection: 'media',
          data: { alt: product.title ?? fix.slug },
          file: loadCandleraImage(fix.imageKey),
        })
        data.extraPhotos = [media.id as number]
      } catch (err) {
        payload.logger.warn(
          `fix-product-listings: image upload for "${fix.slug}" failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
    }

    if (Object.keys(data).length === 0) {
      payload.logger.info(`fix-product-listings: "${fix.slug}" already correct — no change`)
      continue
    }

    await payload.update({ collection: 'products', id: product.id, data, overrideAccess: true })
    updatedCount += 1
    payload.logger.info(
      `fix-product-listings: updated "${fix.slug}" (${Object.keys(data).join(', ')})`,
    )
  }

  payload.logger.info(`fix-product-listings: done — ${updatedCount} product(s) updated`)
  process.exit(0)
}

run().catch((err) => {
  console.error('fix-product-listings failed:', err)
  process.exit(1)
})
