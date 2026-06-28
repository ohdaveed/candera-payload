import { describe, it, expect, vi, beforeEach } from 'vite-plus/test'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
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

  async findProductBySlug(slug: string): Promise<{ id: number | string } | null> {
    for (const [etsyId, data] of this.products) {
      if (data.slug === slug) return { id: `prod-${etsyId}` }
    }
    return null
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
    _listingId: number,
    etsyImageId: number,
    _imageUrl: string,
    _altText: string,
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
      { etsySource, productStore, mediaStorage, logger },
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
    // Raw Etsy payload preserved as a backup; the clean slug is derived from the
    // curated title (no listing ID appended when there is no collision).
    expect(savedProduct?.etsyTitle).toBe('Amber Forest Candle')
    expect(savedProduct?.rawEtsyDescription).toBe(
      'Smells like pine and cedar.\nCured in stillness.',
    )
    expect(savedProduct?.slug).toBe('amber-forest-candle')
    // Primary image is sync-owned (etsyPrimaryImage); extraPhotos is the editor
    // gallery and is not seeded by the sync.
    expect(savedProduct?.etsyPrimaryImage).toBe('media-999')
    expect(savedProduct?.extraPhotos).toBeUndefined()
    // Synced products must be published so they appear in the public catalog
    expect(savedProduct?._status).toBe('published')

    // Verify Lexical rich text transformation
    expect(savedProduct?.description).toBeDefined()
    const description = savedProduct?.description as unknown as {
      root: { children: { children: { text: string }[] }[] }
    }
    expect(description?.root?.children?.length).toBe(2)
    expect(description?.root?.children?.[0]?.children?.[0]?.text).toBe(
      'Smells like pine and cedar.',
    )
  })

  it('parses specifications, scentProfile, tagline, and burnTime from description and listing properties', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 102,
        title: 'Seashell Garden Glow Candle',
        description: `Bring the calm rhythm of the ocean into your space with Seashell Garden Glow — a botanical candle inspired by coastal shores.

✨ Product Details
• Candle weight: 15 oz
• Weight with box: 17.5 oz
• Height with sea shells: 4 inches (11 cm)
• Width: 3 inches (9 cm)
• Box dimensions:
• Length: 6 inches
• Width: 4 inches
• Height: 4 inches

🎁 What's Included
• Seashell Garden Glow candle

🌸 Scent Profile
• Top Note: Sea Breeze
• Heart Note: Driftwood
• Base Note: Salt Air
• Burn Time: 60 Hours`,
        materials: ['soy wax', 'beeswax', 'sea shells'],
      },
    ]

    const result = await engine.sync(
      { type: 'shop', shopId: 12345 },
      { etsySource, productStore, mediaStorage, logger },
    )

    expect(result.success).toBe(true)
    expect(result.count).toBe(1)

    const savedProduct = productStore.products.get(102)
    expect(savedProduct).toBeDefined()
    expect(savedProduct?.tagline).toBe(
      'Bring the calm rhythm of the ocean into your space with Seashell Garden Glow — a botanical candle inspired by coastal shores.',
    )
    expect(savedProduct?.burnTime).toBe('60 Hours')
    expect(savedProduct?.scentProfile).toEqual({
      top: 'Sea Breeze',
      heart: 'Driftwood',
      base: 'Salt Air',
    })
    // Shipping/box logistics are stripped from customer specs: "Weight with box"
    // and the "Box dimensions" Length/Width/Height block are dropped (still kept
    // verbatim in rawEtsyDescription). Product-level weight and dimensions stay.
    expect(savedProduct?.specifications).toEqual([
      { label: 'Candle weight', value: '15 oz' },
      { label: 'Height with sea shells', value: '4 inches (11 cm)' },
      { label: 'Width', value: '3 inches (9 cm)' },
      { label: 'Materials', value: 'Soy wax, beeswax, sea shells' },
    ])
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
      { etsySource, productStore, mediaStorage, logger },
    )

    // downloadAndRegisterMedia should not have been called because it was resolved in-memory
    expect(mediaStorage.downloadCalls).toBe(0)
    expect(productStore.products.get(101)?.etsyPrimaryImage).toBe('existing-media-id')
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
      { etsySource, productStore, mediaStorage, logger },
    )

    // The sync should succeed and count should be 1
    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
    expect(result.failures.length).toBe(0)

    // Product is registered without a primary image link
    const saved = productStore.products.get(201)
    expect(saved).toBeDefined()
    expect(saved?.etsyPrimaryImage).toBeUndefined()
    expect(saved?.extraPhotos).toBeUndefined()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(logger.warn)).toHaveBeenCalled()
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
      { etsySource, productStore, mediaStorage, logger },
    )

    expect(result.success).toBe(false) // partial failure should not report success
    expect(result.count).toBe(1) // only 1 succeeded
    expect(result.failures.length).toBe(1)
    expect(result.failures[0].listingId).toBe(301)
    expect(result.failures[0].error).toContain('DB Constraint Violation')

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(logger.error)).toHaveBeenCalled()
  })

  it('records requested listings that Etsy never returns as failures', async () => {
    const engine = new EtsySyncEngine()

    // Requested 501 and 502, but the source only returns 501 (502 failed to fetch)
    etsySource.mockListings = [
      {
        listing_id: 501,
        title: 'Returned Candle',
        description: 'Fetched successfully.',
      },
    ]

    const result = await engine.sync(
      { type: 'listings', listingIds: [501, 502] },
      { etsySource, productStore, mediaStorage, logger },
    )

    expect(result.success).toBe(false) // 502 never came back
    expect(result.count).toBe(1)
    expect(result.failures).toEqual([{ listingId: 502, error: 'Listing not fetched from Etsy' }])
    expect(productStore.products.has(501)).toBe(true)
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
      { etsySource, productStore, mediaStorage, logger },
    )

    expect(result.success).toBe(true)
    expect(result.count).toBe(1) // Only the candle should be synced
    expect(productStore.products.has(401)).toBe(false)
    expect(productStore.products.has(402)).toBe(true)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
      expect.stringContaining('Skipping listing 401'),
    )
  })

  it('derives a clean title from a keyword-stuffed Etsy title and keeps the raw as backup', async () => {
    const engine = new EtsySyncEngine()

    const rawTitle =
      "Anya's Eyes Candle | Hand Poured Botanical Soy Candle | Gift for Her | Floral Scented"
    etsySource.mockListings = [{ listing_id: 700, title: rawTitle, description: 'A quiet bloom.' }]

    await engine.sync(
      { type: 'shop', shopId: 1 },
      { etsySource, productStore, mediaStorage, logger },
    )

    const saved = productStore.products.get(700)
    // Only the first segment (the product name) becomes the clean title.
    expect(saved?.title).toBe("Anya's Eyes Candle")
    expect(saved?.etsyTitle).toBe(rawTitle)
    // The slug is derived from the clean title (apostrophe stripped, no listing
    // ID) and matches Payload's slugify exactly.
    expect(saved?.slug).toBe('anyas-eyes-candle')
  })

  it('protects editor curation on re-sync: only sync-owned fields are sent when the product exists', async () => {
    const engine = new EtsySyncEngine()

    // A product already exists for this listing (i.e. an editor has curated it).
    productStore.products.set(800, {
      etsyListingId: 800,
      title: 'Curated Name',
    } as ProductUpsertInput)

    etsySource.mockListings = [
      {
        listing_id: 800,
        title: 'Raw Etsy Candle | SEO | Keywords',
        description: 'New marketplace copy.',
        price: { amount: 4200, divisor: 100, currency_code: 'USD' },
      },
    ]

    await engine.sync(
      { type: 'shop', shopId: 1 },
      { etsySource, productStore, mediaStorage, logger },
    )

    // The data sent to upsert on an existing product carries sync-owned fields...
    const sent = productStore.products.get(800)
    expect(sent?.etsyTitle).toBe('Raw Etsy Candle | SEO | Keywords')
    expect(sent?.rawEtsyDescription).toBe('New marketplace copy.')
    expect(sent?.price).toBe(42)
    expect(sent?.currency).toBe('USD')
    expect(sent?.priceSyncedAt).toBeDefined()
    // ...but withholds editor-owned fields so curation is never overwritten.
    expect(sent?.title).toBeUndefined()
    expect(sent?.description).toBeUndefined()
    expect(sent?._status).toBeUndefined()
  })

  it('disambiguates colliding slugs so two listings sharing a name are both created', async () => {
    const engine = new EtsySyncEngine()

    // Two distinct listings whose clean titles (first segment) are identical.
    etsySource.mockListings = [
      {
        listing_id: 111,
        title: 'Vanilla Bean Candle | Hand Poured',
        description: 'A.',
      },
      {
        listing_id: 222,
        title: 'Vanilla Bean Candle | Gift Set',
        description: 'B.',
      },
    ]

    const result = await engine.sync(
      { type: 'shop', shopId: 1 },
      { etsySource, productStore, mediaStorage, logger },
    )

    // Both products are created — the second is not dropped on a slug collision.
    expect(result.success).toBe(true)
    expect(result.count).toBe(2)
    expect(productStore.products.size).toBe(2)

    // First wins the clean slug; the second falls back to the listing-id suffix.
    expect(productStore.products.get(111)?.slug).toBe('vanilla-bean-candle')
    expect(productStore.products.get(222)?.slug).toBe('vanilla-bean-candle-222')
  })

  it('skips both price and currency when the Etsy currency is unsupported', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 900,
        title: 'Yen Candle',
        description: 'Imported.',
        price: { amount: 420000, divisor: 100, currency_code: 'JPY' },
      },
    ]

    await engine.sync(
      { type: 'shop', shopId: 1 },
      { etsySource, productStore, mediaStorage, logger },
    )

    // A fresh foreign price must not be paired with the row's default currency,
    // so neither is written; the listing is logged instead.
    const saved = productStore.products.get(900)
    expect(saved?.price).toBeUndefined()
    expect(saved?.currency).toBeUndefined()
    expect(saved?.priceSyncedAt).toBeUndefined()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
      expect.stringContaining('unsupported currency'),
    )
  })

  it('keeps specs whose label only contains a shipping word as a substring', async () => {
    const engine = new EtsySyncEngine()

    etsySource.mockListings = [
      {
        listing_id: 950,
        title: 'Boxwood Candle',
        description: `Product Details
• Boxwood accent: Hand-carved
• Weight with box: 17.5 oz`,
      },
    ]

    await engine.sync(
      { type: 'shop', shopId: 1 },
      { etsySource, productStore, mediaStorage, logger },
    )

    const saved = productStore.products.get(950)
    // "Boxwood" is kept (word boundary), "Weight with box" is dropped.
    expect(saved?.specifications).toEqual([{ label: 'Boxwood accent', value: 'Hand-carved' }])
  })
})

describe('Etsy description → Lexical (official Payload converter)', () => {
  it('converts markdown headings and lists into structured Lexical nodes', async () => {
    // Uses the project's real editor config so the stored JSON matches the
    // Products.description field editor — proving production sync produces rich
    // Lexical (heading/list), not one paragraph per line.
    const editorConfig = await editorConfigFactory.default({ config: await configPromise })
    const lexical = convertMarkdownToLexical({
      editorConfig,
      markdown: '# Scent Notes\n\n- Top: Bergamot\n- Heart: Jasmine\n- Base: Cedar',
    })

    const types = (lexical.root.children as Array<{ type: string }>).map((c) => c.type)
    expect(types).toContain('heading')
    expect(types).toContain('list')
  })
})
