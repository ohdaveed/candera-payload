import { describe, it, expect, vi, beforeEach } from 'vite-plus/test'
import {
  EtsySyncEngine,
  EtsySourcePort,
  ProductStorePort,
  MediaStoragePort,
  LoggerPort,
  RawEtsyListing,
  ProductUpsertInput,
  SyncSource,
} from '@/utilities/syncEtsy'

class InMemoryEtsySourceAdapter implements EtsySourcePort {
  public mockListings: RawEtsyListing[] = []

  async fetchListings(_source: SyncSource): Promise<RawEtsyListing[]> {
    return this.mockListings
  }
}

class InMemoryProductStoreAdapter implements ProductStorePort {
  public products = new Map<number, ProductUpsertInput>()
  public upsertCalls = 0
  public findCalls = 0
  public txCalls = 0

  async findProductByEtsyId(etsyListingId: number): Promise<{ id: number | string } | null> {
    this.findCalls++
    const existing = this.products.get(etsyListingId)
    return existing ? { id: `prod-${etsyListingId}` } : null
  }

  async upsertProduct(etsyListingId: number, data: ProductUpsertInput): Promise<number | string> {
    this.upsertCalls++
    this.products.set(etsyListingId, data)
    return `prod-${etsyListingId}`
  }

  async transaction<T>(operation: (txStore: ProductStorePort) => Promise<T>): Promise<T> {
    this.txCalls++
    return await operation(this)
  }
}

class InMemoryMediaStorageAdapter implements MediaStoragePort {
  public media = new Map<number, number | string>()
  public findCalls = 0
  public downloadCalls = 0

  async findMediaByEtsyImageId(etsyImageId: number): Promise<number | string | null> {
    this.findCalls++
    return this.media.get(etsyImageId) || null
  }

  async downloadAndRegisterMedia(
    listingId: number,
    etsyImageId: number,
    _imageUrl: string,
    _altText: string
  ): Promise<number | string> {
    this.downloadCalls++
    const id = `media-${etsyImageId}`
    this.media.set(etsyImageId, id)
    return id
  }
}

describe('EtsySyncEngine', () => {
  let etsySource: InMemoryEtsySourceAdapter
  let productStore: InMemoryProductStoreAdapter
  let mediaStorage: InMemoryMediaStorageAdapter
  let logger: LoggerPort

  beforeEach(() => {
    etsySource = new InMemoryEtsySourceAdapter()
    productStore = new InMemoryProductStoreAdapter()
    mediaStorage = new InMemoryMediaStorageAdapter()
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
  })

  it('transforms listings and registers them in the product store', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 101,
        title: 'Amber Forest Candle',
        description: 'Smells like pine and cedar.\nCured in stillness.',
        images: [
          {
            listing_image_id: 999,
            url_fullxfull: 'https://etsy.com/image.jpg',
            alt_text: 'Amber candle',
          },
        ],
      },
    ]

    const result = await engine.sync(
      { type: 'shop', shopId: 12345 },
      { etsySource, productStore, mediaStorage, logger }
    )

    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
    expect(result.failures.length).toBe(0)

    // Verify media registration
    expect(mediaStorage.downloadCalls).toBe(1)
    expect(mediaStorage.media.get(999)).toBe('media-999')

    // Verify product registration details
    const savedProduct = productStore.products.get(101)
    expect(savedProduct).toBeDefined()
    expect(savedProduct?.title).toBe('Amber Forest Candle')
    expect(savedProduct?.slug).toBe('amber-forest-candle-101')
    expect(savedProduct?.extraPhotos).toEqual(['media-999'])

    // Verify Lexical rich text transformation
    expect(savedProduct?.description).toBeDefined()
    const description = savedProduct?.description as any
    expect(description?.root?.children?.length).toBe(2)
    expect(description?.root?.children?.[0]?.children?.[0]?.text).toBe(
      'Smells like pine and cedar.',
    )
  })

  it('skips media download if the image already exists (idempotency)', async () => {
    const engine = new EtsySyncEngine()

    // Pre-seed media mapping
    mediaStorage.media.set(999, 'existing-media-id')

    etsySource.mockListings = [
      {
        listing_id: 101,
        title: 'Amber Forest Candle',
        description: 'Desc',
        images: [
          {
            listing_image_id: 999,
            url_fullxfull: 'https://etsy.com/image.jpg',
          },
        ],
      },
    ]

    await engine.sync(
      { type: 'listings', listingIds: [101] },
      { etsySource, productStore, mediaStorage, logger }
    )

    // downloadAndRegisterMedia should not have been called because it was resolved in-memory
    expect(mediaStorage.downloadCalls).toBe(0)
    expect(productStore.products.get(101)?.extraPhotos).toEqual(['existing-media-id'])
  })

  it('recovers gracefully and continues processing if image download fails', async () => {
    const engine = new EtsySyncEngine()

    mediaStorage.downloadAndRegisterMedia = vi.fn().mockRejectedValue(new Error('Network Timeout'))

    etsySource.mockListings = [
      {
        listing_id: 201,
        title: 'Good Candle',
        description: 'Test description',
        images: [{ listing_image_id: 555, url_fullxfull: 'https://etsy.com/bad.jpg' }],
      },
    ]

    const result = await engine.sync(
      { type: 'shop', shopId: 123 },
      { etsySource, productStore, mediaStorage, logger }
    )

    // The sync should succeed and count should be 1
    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
    expect(result.failures.length).toBe(0)

    // Product is registered without extraPhotos link
    const saved = productStore.products.get(201)
    expect(saved).toBeDefined()
    expect(saved?.extraPhotos).toBeUndefined()
    expect(logger.warn).toHaveBeenCalled()
  })

  it('recovers from single item DB failures and records errors in results without crashing', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 301,
        title: 'Failing Candle',
        description: 'Will fail database commit',
      },
      {
        listing_id: 302,
        title: 'Successful Candle',
        description: 'Will pass database commit',
      },
    ]

    productStore.upsertProduct = vi
      .fn()
      .mockRejectedValueOnce(new Error('DB Constraint Violation'))
      .mockResolvedValueOnce('prod-302')

    const result = await engine.sync(
      { type: 'shop', shopId: 123 },
      { etsySource, productStore, mediaStorage, logger }
    )

    expect(result.success).toBe(true)
    expect(result.count).toBe(1) // only 1 succeeded
    expect(result.failures.length).toBe(1)
    expect(result.failures[0].listingId).toBe(301)
    expect(result.failures[0].error).toContain('DB Constraint Violation')

    expect(logger.error).toHaveBeenCalled()
  })

  it('skips non-candle listings during sync', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 401,
        title: 'Nuova Fontebasso Italy Salad Plate',
        description: 'Not a candle.',
      },
      {
        listing_id: 402,
        title: 'Botanical Garden Candle',
        description: 'Valid candle.',
      },
    ]

    const result = await engine.sync(
      { type: 'shop', shopId: 123 },
      { etsySource, productStore, mediaStorage, logger }
    )

    expect(result.success).toBe(true)
    expect(result.count).toBe(1) // Only the candle should be synced
    expect(productStore.products.has(401)).toBe(false)
    expect(productStore.products.has(402)).toBe(true)
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipping listing 401')
    )
  })
})
