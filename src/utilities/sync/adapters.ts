import { type Payload } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Product } from '@/payload-types'
import { EtsyClient, DefaultPayloadTokenRepository } from '../etsyClient'
import { syncLogger } from '../logger'
import { EtsySyncEngine } from './engine'
import type {
  EtsySourcePort,
  MediaStoragePort,
  ProductStorePort,
  ProductUpsertInput,
  RawEtsyListing,
  SyncSource,
} from './types'

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
  constructor(
    private payload: Payload,
    // When set, every Local API call runs on this transaction's connection.
    private transactionID?: number | string,
  ) {}

  // Payload's Local API joins an open transaction only when the call carries a
  // req with its transactionID — without this, reads/writes run on the default
  // connection and commit/rollback don't cover them.
  private reqArg(): { req?: { transactionID: number | string } } {
    return this.transactionID !== undefined ? { req: { transactionID: this.transactionID } } : {}
  }

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
      ...this.reqArg(),
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
      ...this.reqArg(),
    })
    return res.docs.length > 0 ? { id: res.docs[0].id } : null
  }

  async upsertProduct(
    etsyListingId: number,
    data: ProductUpsertInput,
    existing?: { id: number | string } | null,
  ): Promise<number | string> {
    // Trust a caller-provided existence check (from the same transaction);
    // only query when the caller didn't already look the product up.
    const target = existing !== undefined ? existing : await this.findProductByEtsyId(etsyListingId)
    if (target) {
      const doc = await this.payload.update({
        collection: 'products',
        id: target.id,
        data: data as unknown as Product,
        ...this.reqArg(),
      })
      return doc.id
    } else {
      const doc = await this.payload.create({
        collection: 'products',
        data: data as unknown as Product,
        ...this.reqArg(),
      })
      return doc.id
    }
  }

  async transaction<T>(operation: (txStore: ProductStorePort) => Promise<T>): Promise<T> {
    if (this.payload.db.beginTransaction) {
      const transactionID = await this.payload.db.beginTransaction()
      try {
        const transactionalStore = new ProductionProductStoreAdapter(
          this.payload,
          transactionID ?? undefined,
        )
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
      // Existence check only: skip relationship population and pagination count.
      depth: 0,
      limit: 1,
      pagination: false,
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
