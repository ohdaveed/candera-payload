import type { Product } from '@/payload-types'
import {
  CandleListingSchema,
  type EtsySourcePort,
  type LoggerPort,
  type MediaStoragePort,
  type ProductStorePort,
  type ProductUpsertInput,
  type RawEtsyListing,
  type SyncResult,
  type SyncSource,
} from './types'
import {
  cleanEtsyDescription,
  deriveCleanTitle,
  parseEtsyDescription,
  slugify,
} from './descriptionParser'

// Currencies the storefront's `currency` select supports. Keep in sync with the
// options in `src/collections/Products.ts`.
const SUPPORTED_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP']

// -------------------------------------------------------------
// CORE SYNC ENGINE IMPLEMENTATION
// -------------------------------------------------------------

export class EtsySyncEngine {
  async sync(
    source: SyncSource,
    ports: {
      etsySource: EtsySourcePort
      productStore: ProductStorePort
      mediaStorage: MediaStoragePort
      logger: LoggerPort
      // Converts a (markdown-ish) Etsy description string into Lexical JSON.
      // Injected so the pure engine stays decoupled from the Payload editor
      // config; production wires Payload's official `convertMarkdownToLexical`,
      // and unit tests fall back to the simple paragraph builder below.
      descriptionToRichText?: (markdown: string) => Product['description']
    },
  ): Promise<SyncResult> {
    ports.logger.info(
      source.type === 'listings'
        ? `Starting Etsy sync for ${source.listingIds.length} listing IDs...`
        : `Starting Etsy sync for shop ${source.shopId}...`,
    )

    // Prefer the injected (official Payload) converter; fall back to the simple
    // line-based builder so the engine works headless in unit tests.
    const toRichText = ports.descriptionToRichText ?? ((md: string) => this.textToRichText(md))

    const failures: Array<{ listingId: number; error: string }> = []
    let listings: RawEtsyListing[] = []

    try {
      listings = await ports.etsySource.fetchListings(source)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      ports.logger.error(`Fatal sync failure fetching listings: ${msg}`)
      throw err
    }

    ports.logger.info(`Found ${listings.length} listings on Etsy.`)

    // For an explicit listing-ID sync, any requested ID that Etsy never returns
    // (batch + per-listing fetch both failed) would otherwise vanish silently.
    // Record it as a failure so `success` is honest and callers see the drift.
    if (source.type === 'listings') {
      const fetchedIds = new Set(listings.map((l) => l.listing_id))
      for (const id of source.listingIds) {
        if (!fetchedIds.has(id)) {
          ports.logger.warn(`Requested listing ${id} was not returned by Etsy.`)
          failures.push({ listingId: id, error: 'Listing not fetched from Etsy' })
        }
      }
    }

    if (listings.length === 0) {
      ports.logger.warn('No listings found for the provided source in Etsy API.')
      return { success: failures.length === 0, count: 0, failures }
    }

    let syncedCount = 0

    for (const listing of listings) {
      const { listing_id, title, description, images, price: etsyPrice } = listing

      try {
        // Validation Layer: Ensure listing is a candle
        const validation = CandleListingSchema.safeParse(listing)
        let productType: Product['productType'] = 'candle'

        if (!validation.success) {
          // If this is a manual list sync, we allow non-candle titles for testing/forced sync
          if (source.type === 'listings') {
            ports.logger.info(
              `Manual sync for ${listing_id} ("${title}"): allowing through as vintage product.`,
            )
            productType = 'vintage'
          } else {
            ports.logger.warn(
              `Skipping listing ${listing_id} ("${title}"): ${validation.error.issues[0].message}`,
            )
            continue
          }
        }

        // Download and sync main image if available
        let mainImageId: string | number | undefined = undefined
        if (images && images.length > 0) {
          const mainImage = images[0]
          try {
            const existingMediaId = await ports.mediaStorage.findMediaByEtsyImageId(
              mainImage.listing_image_id,
            )
            if (existingMediaId !== null) {
              mainImageId = existingMediaId
            } else {
              mainImageId = await ports.mediaStorage.downloadAndRegisterMedia(
                listing_id,
                mainImage.listing_image_id,
                mainImage.url_fullxfull,
                mainImage.alt_text || '',
              )
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            ports.logger.warn(
              `Failed to sync image for listing ${listing_id}: ${msg}. Continuing sync.`,
            )
          }
        }

        const parsed = parseEtsyDescription(title, description)

        // Add materials from API if present and not already in specifications
        if (listing.materials && listing.materials.length > 0) {
          const materialsStr = listing.materials.join(', ')
          const specs = parsed.specifications ?? []
          if (!specs.some((s) => s.label.toLowerCase().includes('material'))) {
            const val = materialsStr.charAt(0).toUpperCase() + materialsStr.slice(1)
            specs.push({
              label: 'Materials',
              value: val,
            })
            parsed.specifications = specs
          }
        }

        // Omit empty specifications so we don't wipe out manual entries in Payload.
        if (parsed.specifications?.length === 0) {
          delete parsed.specifications
        }

        // Sync-owned fields: the marketplace is the source of truth, so these
        // are written on every run. They hold the raw Etsy payload as an
        // audit/backup, the live price, and the primary image — never curated
        // editor copy.
        const syncOwned: ProductUpsertInput = {
          etsyListingId: listing_id,
          etsyTitle: title,
          rawEtsyDescription: description,
        }

        // Primary image is sync-owned: refreshed every run so a seller swapping
        // the Etsy photo is reflected on the storefront. The editor's extraPhotos
        // gallery is left untouched; the storefront prefers this image and falls
        // back to extraPhotos[0] for products synced before this field existed.
        syncOwned.etsyPrimaryImage = mainImageId || null

        if (etsyPrice) {
          // Only persist a price the storefront can render correctly. Writing the
          // price while dropping an unsupported currency would pair a fresh
          // foreign amount with the row's stale/default currency (a misleading
          // price), so skip both and log instead.
          if (SUPPORTED_CURRENCIES.includes(etsyPrice.currency_code)) {
            syncOwned.price = etsyPrice.amount / etsyPrice.divisor
            syncOwned.currency = etsyPrice.currency_code as Product['currency']
            syncOwned.priceSyncedAt = new Date().toISOString()
          } else {
            ports.logger.warn(
              `Listing ${listing_id}: unsupported currency "${etsyPrice.currency_code}"; skipping price update.`,
            )
          }
        }

        // Editor-owned fields: seeded once on create, then left untouched so
        // manual curation (clean title, story, scent, gallery) survives nightly
        // re-syncs.
        const editorOwned: ProductUpsertInput = {
          etsyListingId: listing_id,
          title: deriveCleanTitle(title),
          description: toRichText(cleanEtsyDescription(description)),
          productType,
          // Publish on first sync so active Etsy listings appear immediately;
          // visibility is editor-owned thereafter (a manual unpublish sticks).
          _status: 'published',
          ...parsed,
        }

        // Perform the upsert inside a transaction boundary
        await ports.productStore.transaction(async (txStore) => {
          // Decide create vs. update inside the transaction so we know which
          // fields to write: new products get the full payload, existing ones
          // receive only sync-owned fields so editor curation is never clobbered.
          const existing = await txStore.findProductByEtsyId(listing_id)
          let productData: ProductUpsertInput
          if (existing) {
            productData = syncOwned
          } else {
            // The slug column is unique. Derive a clean slug from the curated title
            // and, if another product already owns it, append the Etsy listing id
            // so two listings sharing a name don't collide — otherwise the second
            // create would hit the unique index and that product would be dropped.
            // `slugify` mirrors Payload's own slugify, so the value we check here
            // matches the value the slugField hook will ultimately store.
            const baseSlug = slugify(editorOwned.title ?? title) || `product-${listing_id}`
            const slugTaken = await txStore.findProductBySlug(baseSlug)
            editorOwned.slug = slugTaken ? `${baseSlug}-${listing_id}` : baseSlug
            productData = { ...syncOwned, ...editorOwned }
          }
          await txStore.upsertProduct(listing_id, productData, existing)
        })

        syncedCount++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        ports.logger.error(`Error processing listing ${listing_id}: ${msg}`)
        failures.push({ listingId: listing_id, error: msg })
      }
    }

    // `success` reflects whether every listing synced. Partial failures return
    // `false` so callers can surface drift instead of trusting a blanket `true`.
    return { success: failures.length === 0, count: syncedCount, failures }
  }

  /**
   * Converts plain text to a basic Lexical rich text structure.
   */
  private textToRichText(text: string): Product['description'] {
    if (!text) return null
    return {
      root: {
        type: 'root',
        format: 'left',
        indent: 0,
        version: 1,
        children: text.split('\n').map((line) => ({
          type: 'paragraph',
          format: 'left',
          indent: 0,
          version: 1,
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: line,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
        })),
        direction: 'ltr',
      },
    }
  }
}
