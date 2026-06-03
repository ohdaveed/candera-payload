import { z } from 'zod'
import { type Payload } from 'payload'
import { EtsyClient, DefaultPayloadTokenRepository } from './etsyClient'
import type { Product } from '@/payload-types'
import { syncLogger } from './logger'

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
  images?: RawEtsyImage[]
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
  title: string
  slug: string
  description: Product['description']
  extraPhotos?: (number | string)[]
  etsyListingId: number
}

export interface ProductStorePort {
  findProductByEtsyId(etsyListingId: number): Promise<{ id: number | string } | null>
  upsertProduct(etsyListingId: number, data: ProductUpsertInput): Promise<number | string>
  transaction<T>(operation: (txStore: ProductStorePort) => Promise<T>): Promise<T>
}

export interface MediaStoragePort {
  findMediaByEtsyImageId(etsyImageId: number): Promise<number | string | null>
  downloadAndRegisterMedia(
    listingId: number,
    etsyImageId: number,
    imageUrl: string,
    altText: string
  ): Promise<number | string>
}

export interface LoggerPort {
  info(message: string): void
  warn(message: string): void
  error(message: string | Error, ...args: any[]): void
  debug?(message: string, ...args: any[]): void
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
    }
  ): Promise<SyncResult> {
    ports.logger.info(
      source.type === 'listings'
        ? `Starting Etsy sync for ${source.listingIds.length} listing IDs...`
        : `Starting Etsy sync for shop ${source.shopId}...`
    )

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

    if (listings.length === 0) {
      ports.logger.warn('No listings found for the provided source in Etsy API.')
      return { success: true, count: 0, failures }
    }

    let syncedCount = 0

    for (const listing of listings) {
      const { listing_id, title, description, images } = listing

      try {
        // Validation Layer: Ensure listing is a candle
        const validation = CandleListingSchema.safeParse(listing)
        if (!validation.success) {
          // If this is a manual list sync, we allow non-candle titles for testing/forced sync
          if (source.type === 'listings') {
            ports.logger.info(
              `Manual sync for ${listing_id} ("${title}"): allowing through despite validation failure.`
            )
          } else {
            ports.logger.warn(
              `Skipping listing ${listing_id} ("${title}"): ${validation.error.issues[0].message}`
            )
            continue
          }
        }

        // Simple slug generation logic
        const baseSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')

        const slug = `${baseSlug}-${listing_id}`

        // Download and sync main image if available
        let mainImageId: string | undefined = undefined
        if (images && images.length > 0) {
          const mainImage = images[0]
          try {
            const existingMediaId = await ports.mediaStorage.findMediaByEtsyImageId(mainImage.listing_image_id)
            if (existingMediaId) {
              mainImageId = existingMediaId
            } else {
              mainImageId = await ports.mediaStorage.downloadAndRegisterMedia(
                listing_id,
                mainImage.listing_image_id,
                mainImage.url_fullxfull,
                mainImage.alt_text || ''
              )
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            ports.logger.warn(
              `Failed to sync image for listing ${listing_id}: ${msg}. Continuing sync.`
            )
          }
        }

        const productData: ProductUpsertInput = {
          title,
          slug,
          description: this.textToRichText(description),
          etsyListingId: listing_id,
        }

        if (mainImageId) {
          productData.extraPhotos = [mainImageId]
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

    return { success: true, count: syncedCount, failures }
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
      } catch {
        const results: RawEtsyListing[] = []
        for (const id of source.listingIds) {
          try {
            const data = await this.client.request<RawEtsyListing>(`/listings/${id}`, {
              params: { includes: 'Images' },
            })
            if (data) results.push(data)
          } catch {
            // Allow individual listing failures to keep batch moving
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
        if (this.payload.db.commitTransaction && transactionID !== undefined && transactionID !== null) {
          await this.payload.db.commitTransaction(transactionID)
        }
        return result
      } catch (error) {
        if (this.payload.db.rollbackTransaction && transactionID !== undefined && transactionID !== null) {
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
    altText: string
  ): Promise<number | string> {
    const existingId = await this.findMediaByEtsyImageId(etsyImageId)
    if (existingId) return existingId

    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

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

export async function syncEtsyListings(
  source: number | number[],
  payload: Payload
) {
  const tokenRepository = new DefaultPayloadTokenRepository(payload)
  const client = new EtsyClient(undefined, tokenRepository)

  const isBatch = Array.isArray(source)
  const syncSource: SyncSource = isBatch
    ? { type: 'listings', listingIds: source }
    : { type: 'shop', shopId: source }

  const engine = new EtsySyncEngine()
  const ports = {
    etsySource: new ProductionEtsySourceAdapter(client),
    productStore: new ProductionProductStoreAdapter(payload),
    mediaStorage: new ProductionMediaStorageAdapter(payload),
    logger: syncLogger,
  }

  const result = await engine.sync(syncSource, ports)
  return {
    success: result.success,
    count: result.count,
  }
}
