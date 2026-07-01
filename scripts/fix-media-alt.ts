import 'dotenv/config'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'

// Load .env.local BEFORE the Payload config is imported. payload.config.ts reads
// env at module-eval time, so the config is imported dynamically inside run().
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local'), override: true })

/**
 * Idempotent, in-place fix for the boilerplate image alt text carried over from
 * the Payload website starter. The three Journal post images (white / book / red
 * candle) all shipped with the same generic alt
 * ("Curving abstract shapes with an orange and blue gradient"), which is wrong on
 * every image and identical across all three — a11y + SEO defect.
 *
 * Matches Media docs by filename and writes a descriptive, distinct alt. Only
 * writes when the alt differs, so it is safe to run repeatedly.
 *
 * Run with:  pass-cli run --env-file .env -- pnpm tsx scripts/fix-media-alt.ts
 */

// filename substring -> descriptive alt
const ALT_FIXES: { match: string; alt: string }[] = [
  { match: 'candle-white', alt: 'White botanical candle glowing softly on a neutral surface' },
  { match: 'candle-book', alt: 'Lit candle beside an open book on a cozy wooden surface' },
  { match: 'candle-red', alt: 'Deep red botanical candle with a warm flame' },
]

const BOILERPLATE_ALT = 'Curving abstract shapes with an orange and blue gradient'

async function run(): Promise<void> {
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let updated = 0
  let skipped = 0

  for (const fix of ALT_FIXES) {
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { like: fix.match } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    if (docs.length === 0) {
      payload.logger.warn(`fix-media-alt: no media matching "${fix.match}" — skipping`)
      continue
    }

    for (const doc of docs) {
      if (doc.alt === fix.alt) {
        skipped++
        continue
      }
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { alt: fix.alt },
        overrideAccess: true,
      })
      payload.logger.info(`fix-media-alt: ${doc.filename} → "${fix.alt}"`)
      updated++
    }
  }

  // Safety net: catch any remaining doc still holding the exact boilerplate string.
  const stragglers = await payload.find({
    collection: 'media',
    where: { alt: { equals: BOILERPLATE_ALT } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  if (stragglers.docs.length > 0) {
    payload.logger.warn(
      `fix-media-alt: ${stragglers.docs.length} media doc(s) still hold the boilerplate alt (unmatched filename): ` +
        stragglers.docs.map((d) => d.filename).join(', '),
    )
  }

  payload.logger.info(`fix-media-alt: done — ${updated} updated, ${skipped} already correct`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
