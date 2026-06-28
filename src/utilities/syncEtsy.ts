import { z } from 'zod'
import { type Payload } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { EtsyClient, DefaultPayloadTokenRepository } from './etsyClient'
import type { Product } from '@/payload-types'
import { syncLogger } from './logger'

// Currencies the storefront's `currency` select supports. Keep in sync with the
// options in `src/collections/Products.ts`.
const SUPPORTED_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP']

// Matches shipping/packaging contexts whose dimensions are logistics noise, not
// customer-facing product specs (the raw text is still kept in rawEtsyDescription).
// Anchored to word boundaries so legitimate specs whose labels merely *contain*
// these substrings (e.g. "Boxwood", "Parcel-gilt finish") are not dropped.
const SHIPPING_CONTEXT_RE = /\b(?:box|shipping|package|parcel|postage)\b/i

// Validation schema for candle listings
const CandleListingSchema = z.object({
  listing_id: z.number(),
  title: z.string().refine((val) => val.toLowerCase().includes('candle'), {
    message: "Listing title must contain the word 'candle' to be processed as a candle product.",
  }),
  description: z.string(),
  images: z.array(z.any()).optional(),
})

// Raw schemas matching platform fields
export interface RawEtsyImage {
  listing_image_id: number
  url_fullxfull: string
  alt_text?: string
}

export interface RawEtsyListing {
  listing_id: number
  title: string
  description: string
  price?: {
    amount: number
    divisor: number
    currency_code: string
  }
  images?: RawEtsyImage[]
  materials?: string[]
}

export type SyncSource =
  | { type: 'shop'; shopId: number; limit?: number }
  | { type: 'listings'; listingIds: number[] }

export interface SyncResult {
  success: boolean
  count: number
  failures: Array<{ listingId: number; error: string }>
}

// -------------------------------------------------------------
// PORT INTERFACES
// -------------------------------------------------------------

export interface EtsySourcePort {
  fetchListings(source: SyncSource): Promise<RawEtsyListing[]>
}

export interface ProductUpsertInput {
  // Editor-owned (set on create only — re-syncs must not clobber curation).
  title?: string
  // `slug` is derived from `title` by the collection's slugField hook, so the
  // sync no longer sets it. Kept optional for callers/tests that still inspect it.
  slug?: string
  description?: Product['description']
  productType?: Product['productType']
  _status?: 'draft' | 'published'
  tagline?: string
  burnTime?: string
  vessel?: string
  scentProfile?: {
    top?: string | null
    heart?: string | null
    base?: string | null
  }
  specifications?: Array<{ label: string; value: string }>
  extraPhotos?: (number | string)[]
  // Sync-owned (written on every run — marketplace source of truth).
  etsyListingId: number
  etsyTitle?: string
  rawEtsyDescription?: string
  etsyPrimaryImage?: number | string
  price?: number
  currency?: Product['currency']
  priceSyncedAt?: string
}

export interface ParsedEtsyDescription {
  specifications: Array<{ label: string; value: string }>
  scentProfile?: {
    top?: string
    heart?: string
    base?: string
  }
  burnTime?: string
  vessel?: string
  tagline?: string
}

export interface ProductStorePort {
  findProductByEtsyId(etsyListingId: number): Promise<{ id: number | string } | null>
  // Used to guarantee slug uniqueness before a create: the slug column is unique,
  // so two new listings that derive the same clean slug would collide and the
  // second would be dropped. Returns the existing product with that slug, if any.
  findProductBySlug(slug: string): Promise<{ id: number | string } | null>
  upsertProduct(etsyListingId: number, data: ProductUpsertInput): Promise<number | string>
  transaction<T>(operation: (txStore: ProductStorePort) => Promise<T>): Promise<T>
}

export interface MediaStoragePort {
  findMediaByEtsyImageId(etsyImageId: number): Promise<number | string | null>
  downloadAndRegisterMedia(
    listingId: number,
    etsyImageId: number,
    imageUrl: string,
    altText: string,
  ): Promise<number | string>
}

export interface LoggerPort {
  info(message: string): void
  warn(message: string): void
  error(message: string | Error, ...args: unknown[]): void
  debug?(message: string, ...args: unknown[]): void
}

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

        const parsed = this.parseEtsyDescription(title, description)

        // Add materials from API if present and not already in specifications
        if (listing.materials && listing.materials.length > 0) {
          const materialsStr = listing.materials.join(', ')
          if (!parsed.specifications.some((s) => s.label.toLowerCase().includes('material'))) {
            const val = materialsStr.charAt(0).toUpperCase() + materialsStr.slice(1)
            parsed.specifications.push({
              label: 'Materials',
              value: val,
            })
          }
        }

        if (parsed.specifications.length === 0) {
          // @ts-expect-error Omit empty specifications so we don't wipe out manual entries in Payload
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
        if (mainImageId) {
          syncOwned.etsyPrimaryImage = mainImageId
        }

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
          title: this.deriveCleanTitle(title),
          description: toRichText(this.cleanEtsyDescription(description)),
          productType,
          // Publish on first sync so active Etsy listings appear immediately;
          // visibility is editor-owned thereafter (a manual unpublish sticks).
          _status: 'published',
          ...parsed,
        }

        // Decide create vs. update up front so we know which fields to write:
        // new products get the full payload, existing ones receive only
        // sync-owned fields so editor curation is never clobbered.
        const existing = await ports.productStore.findProductByEtsyId(listing_id)

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
          const baseSlug = this.slugify(editorOwned.title ?? title) || `product-${listing_id}`
          const slugTaken = await ports.productStore.findProductBySlug(baseSlug)
          editorOwned.slug = slugTaken ? `${baseSlug}-${listing_id}` : baseSlug
          productData = { ...syncOwned, ...editorOwned }
        }

        // Perform the upsert inside a transaction boundary
        await ports.productStore.transaction(async (txStore) => {
          await txStore.upsertProduct(listing_id, productData)
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
   * Derives a clean, editor-facing product name from Etsy's keyword-stuffed
   * title. Etsy sellers cram SEO terms after a delimiter ("Anya's Eyes Candle |
   * Hand Poured | Gift for Her"); the product name is the first segment. We take
   * everything before the first delimiter and cap the length so the result is a
   * sensible default — editors refine it in admin, and re-syncs won't overwrite
   * their edit (title is create-only).
   */
  private deriveCleanTitle(rawTitle: string): string {
    const unescaped = this.unescapeHtml(rawTitle).trim()
    // Split on common Etsy separators: pipe, en/em dash, colon, " - ", ", ".
    const firstSegment = unescaped.split(/\s*[|–—:]\s*| - |,\s+/)[0] ?? unescaped
    const cleaned = firstSegment.replace(/\s+/g, ' ').trim()

    if (!cleaned) return unescaped
    // A first segment with no delimiters can still be a long keyword run; keep
    // it readable by falling back to the leading words.
    if (cleaned.length <= 60) return cleaned
    return cleaned.split(' ').slice(0, 8).join(' ')
  }

  /**
   * Slugifies a string identically to Payload's built-in `slugify` (the one the
   * collection's slugField hook uses). Kept in lockstep so the slug we compute
   * for the collision pre-check matches the value the hook stores on create —
   * any drift would make the uniqueness check miss and reintroduce collisions.
   * Source: payload/dist/utilities/slugify.js.
   */
  private slugify(val: string): string {
    return (
      val
        ?.trim()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase() ?? ''
    )
  }

  /**
   * Parses specifications, scentProfile, tagline, and burnTime from raw Etsy description
   * and listing properties.
   */
  private parseEtsyDescription(title: string, description: string): ParsedEtsyDescription {
    const specifications: Array<{ label: string; value: string }> = []
    let top: string | undefined = undefined
    let heart: string | undefined = undefined
    let base: string | undefined = undefined
    let burnTime: string | undefined = undefined
    let vessel: string | undefined = undefined
    let tagline: string | undefined = undefined

    // Extract tagline from first paragraph
    const paragraphs = description
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    if (paragraphs.length > 0) {
      const firstPara = paragraphs[0]
      if (
        firstPara.length < 180 &&
        !firstPara.includes(':') &&
        !firstPara.startsWith('•') &&
        !firstPara.startsWith('-')
      ) {
        tagline = firstPara
      }
    }

    let inDetailsBlock = false
    let inScentBlock = false
    let lastHeading = ''

    const lines = description.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const lowerTrimmed = trimmed.toLowerCase()

      const isBullet = /^\s*[•*\-+]\s*/.test(trimmed)

      // Detect block headers
      if (
        !isBullet &&
        (lowerTrimmed.includes('product details') ||
          lowerTrimmed.includes('item details') ||
          lowerTrimmed.includes('specifications') ||
          lowerTrimmed.includes('dimensions'))
      ) {
        inDetailsBlock = true
        inScentBlock = false
        continue
      }

      if (
        !isBullet &&
        (lowerTrimmed.includes('scent profile') ||
          lowerTrimmed.includes('fragrance profile') ||
          lowerTrimmed.includes('scent notes') ||
          lowerTrimmed.includes('fragrance notes'))
      ) {
        inScentBlock = true
        inDetailsBlock = false
        continue
      }

      if (
        !isBullet &&
        (lowerTrimmed.includes("what's included") ||
          lowerTrimmed.includes('important notes') ||
          lowerTrimmed.includes('shipping') ||
          lowerTrimmed.includes('returns'))
      ) {
        inDetailsBlock = false
        inScentBlock = false
        continue
      }

      // Parse details block
      if (inDetailsBlock) {
        const colonMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^:]+):\s*(.*)$/)
        if (colonMatch && colonMatch[2].trim()) {
          const label = colonMatch[1].trim()
          const value = colonMatch[2].trim()
          const lowerLabel = label.toLowerCase()

          if (lowerLabel.includes('burn time')) {
            burnTime = value
          } else if (lowerLabel === 'vessel') {
            vessel = value
          } else {
            const isDimension =
              lowerLabel === 'length' || lowerLabel === 'width' || lowerLabel === 'height'

            // Drop shipping/box logistics from customer specs — either a label
            // that names a shipping context ("Weight with box") or a dimension
            // nested under one ("Box dimensions:" → Length/Width/Height).
            if (
              SHIPPING_CONTEXT_RE.test(label) ||
              (isDimension && SHIPPING_CONTEXT_RE.test(lastHeading))
            ) {
              continue
            }

            let finalLabel = label
            if (lastHeading && isDimension) {
              finalLabel = `${lastHeading} ${label}`
            }
            specifications.push({ label: finalLabel, value })
          }
        } else {
          if (trimmed.endsWith(':')) {
            lastHeading = trimmed
              .substring(0, trimmed.length - 1)
              .replace(/^[•*\-+]\s*/, '')
              .trim()
          } else {
            lastHeading = ''
          }
        }
      }

      // Parse scent block
      if (inScentBlock) {
        const colonMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^:]+):\s*(.+)$/)
        if (colonMatch) {
          const label = colonMatch[1].trim().toLowerCase()
          const value = colonMatch[2].trim()
          if (value) {
            if (label.includes('top')) {
              top = value
            } else if (
              label.includes('heart') ||
              label.includes('middle') ||
              label.includes('heart note')
            ) {
              heart = value
            } else if (label.includes('base')) {
              base = value
            }
          }
        } else {
          const commaMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^,]+),\s*([^,]+),\s*([^,]+)$/)
          if (commaMatch) {
            top = commaMatch[1].trim()
            heart = commaMatch[2].trim()
            base = commaMatch[3].trim()
          }
        }
      }
    }

    // Fallbacks
    if (!burnTime) {
      const burnMatch = description.match(/burn\s*time:\s*([^•\n]+)/i)
      if (burnMatch) burnTime = burnMatch[1].trim()
    }
    if (!vessel) {
      const vesselMatch = description.match(/vessel:\s*([^•\n]+)/i)
      if (vesselMatch) vessel = vesselMatch[1].trim()
    }

    const result: ParsedEtsyDescription = { specifications }
    if (top || heart || base) {
      result.scentProfile = { top, heart, base }
    }
    if (burnTime) result.burnTime = burnTime
    if (vessel) result.vessel = vessel
    if (tagline) result.tagline = tagline

    return result
  }

  /**
   * Unescapes common HTML entities.
   */
  private unescapeHtml(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    }
    return text.replace(/&[#\w]+;/g, (match) => entities[match] || match)
  }

  /**
   * Cleans up raw Etsy listing descriptions by removing promotional fluff,
   * unescaping HTML entities, and stripping external shop links.
   */
  private cleanEtsyDescription(text: string): string {
    if (!text) return ''

    let cleaned = this.unescapeHtml(text)

    // Remove dash separators
    cleaned = cleaned.replace(/-{3,}/g, '')

    // Remove common Etsy-specific promotional phrases
    const promoPhrases = [
      /Please visit my store for more fantastic items to buy!/gi,
      /Click the heart in the Favorite Shop box at the top of this page/gi,
      /Thank you for visiting and purchase!/gi,
      /Visit my shop at: https:\/\/www\.etsy\.com\/ca\/shop\/[a-z0-9-]+/gi,
      /https:\/\/www\.etsy\.com\/ca\/shop\/[a-z0-9-]+/gi,
    ]

    promoPhrases.forEach((phrase) => {
      cleaned = cleaned.replace(phrase, '')
    })

    // Trim whitespace and double newlines
    return cleaned.trim().replace(/\n{3,}/g, '\n\n')
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

// -------------------------------------------------------------
// CONCRETE ADAPTERS
// -------------------------------------------------------------

export class ProductionEtsySourceAdapter implements EtsySourcePort {
  constructor(private client: EtsyClient) {}

  async fetchListings(source: SyncSource): Promise<RawEtsyListing[]> {
    if (source.type === 'listings') {
      try {
        const data = await this.client.getListingsBatch(source.listingIds, ['Images'])
        return (data.results || []) as RawEtsyListing[]
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        syncLogger.warn(`Batch listing fetch failed (${msg}); falling back to per-listing fetch.`)
        const results: RawEtsyListing[] = []
        for (const id of source.listingIds) {
          try {
            const data = await this.client.request<RawEtsyListing>(`/listings/${id}`, {
              params: { includes: 'Images' },
            })
            if (data) results.push(data)
          } catch (listingErr) {
            const listingMsg = listingErr instanceof Error ? listingErr.message : String(listingErr)
            // Keep the batch moving, but log so dropped listings are visible
            // rather than silently causing drift.
            syncLogger.warn(`Failed to fetch listing ${id}: ${listingMsg}. Skipping.`)
          }
        }
        return results
      }
    } else {
      const data = await this.client.getShopListings(source.shopId, source.limit ?? 100)
      return (data.results || []) as RawEtsyListing[]
    }
  }
}

export class ProductionProductStoreAdapter implements ProductStorePort {
  constructor(private payload: Payload) {}

  async findProductByEtsyId(etsyListingId: number): Promise<{ id: number | string } | null> {
    const res = await this.payload.find({
      collection: 'products',
      where: {
        etsyListingId: {
          equals: etsyListingId,
        },
      },
      // Existence check only: skip relationship population and pagination count.
      depth: 0,
      limit: 1,
      pagination: false,
    })
    return res.docs.length > 0 ? { id: res.docs[0].id } : null
  }

  async findProductBySlug(slug: string): Promise<{ id: number | string } | null> {
    const res = await this.payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 0,
      limit: 1,
      pagination: false,
    })
    return res.docs.length > 0 ? { id: res.docs[0].id } : null
  }

  async upsertProduct(etsyListingId: number, data: ProductUpsertInput): Promise<number | string> {
    const existing = await this.findProductByEtsyId(etsyListingId)
    if (existing) {
      const doc = await this.payload.update({
        collection: 'products',
        id: existing.id,
        data: data as unknown as Product,
      })
      return doc.id
    } else {
      const doc = await this.payload.create({
        collection: 'products',
        data: data as unknown as Product,
      })
      return doc.id
    }
  }

  async transaction<T>(operation: (txStore: ProductStorePort) => Promise<T>): Promise<T> {
    if (this.payload.db.beginTransaction) {
      const transactionID = await this.payload.db.beginTransaction()
      try {
        const transactionalStore = new ProductionProductStoreAdapter(this.payload)
        const result = await operation(transactionalStore)
        if (
          this.payload.db.commitTransaction &&
          transactionID !== undefined &&
          transactionID !== null
        ) {
          await this.payload.db.commitTransaction(transactionID)
        }
        return result
      } catch (error) {
        if (
          this.payload.db.rollbackTransaction &&
          transactionID !== undefined &&
          transactionID !== null
        ) {
          await this.payload.db.rollbackTransaction(transactionID)
        }
        throw error
      }
    }
    return await operation(this)
  }
}

export class ProductionMediaStorageAdapter implements MediaStoragePort {
  constructor(private payload: Payload) {}

  async findMediaByEtsyImageId(etsyImageId: number): Promise<number | string | null> {
    const res = await this.payload.find({
      collection: 'media',
      where: {
        etsyImageId: {
          equals: etsyImageId,
        },
      },
    })
    return res.docs.length > 0 ? res.docs[0].id : null
  }

  async downloadAndRegisterMedia(
    listingId: number,
    etsyImageId: number,
    imageUrl: string,
    altText: string,
  ): Promise<number | string> {
    const existingId = await this.findMediaByEtsyImageId(etsyImageId)
    if (existingId) return existingId

    // Bound the image download so a hung CDN response can't stall the serial sync.
    // The timer must stay active until the body is fully read: a host can return
    // headers promptly and then stall mid-body, so clearing it right after `fetch`
    // resolves would leave `arrayBuffer()` unbounded.
    const IMAGE_TIMEOUT_MS = 20_000
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)
    let buffer: Buffer
    try {
      const response = await fetch(imageUrl, { signal: controller.signal })
      if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)
      const arrayBuffer = await response.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } catch (err) {
      if (controller.signal.aborted) {
        throw new Error(`Image download timed out after ${IMAGE_TIMEOUT_MS}ms: ${imageUrl}`)
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }

    const media = await this.payload.create({
      collection: 'media',
      data: {
        etsyImageId,
        alt: altText,
      },
      file: {
        data: buffer,
        name: `etsy-${listingId}-${etsyImageId}.jpg`,
        mimetype: 'image/jpeg',
        size: buffer.length,
      },
    })

    return media.id
  }
}

// -------------------------------------------------------------
// ORIGINAL SHALLOW ENTRY POINT
// -------------------------------------------------------------

export async function syncEtsyListings(source: number | number[], payload: Payload) {
  const tokenRepository = new DefaultPayloadTokenRepository(payload)
  const client = new EtsyClient(undefined, tokenRepository)

  const isBatch = Array.isArray(source)
  const syncSource: SyncSource = isBatch
    ? { type: 'listings', listingIds: source }
    : { type: 'shop', shopId: source }

  // Build the editor config once, then convert each Etsy description with
  // Payload's official Markdown→Lexical converter so bullet lists, headings, and
  // paragraphs become real Lexical nodes instead of one paragraph per line.
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  const engine = new EtsySyncEngine()
  const ports = {
    etsySource: new ProductionEtsySourceAdapter(client),
    productStore: new ProductionProductStoreAdapter(payload),
    mediaStorage: new ProductionMediaStorageAdapter(payload),
    logger: syncLogger,
    descriptionToRichText: (markdown: string) =>
      convertMarkdownToLexical({ editorConfig, markdown }) as unknown as Product['description'],
  }

  const result = await engine.sync(syncSource, ports)
  return {
    success: result.success,
    count: result.count,
    failures: result.failures,
  }
}
