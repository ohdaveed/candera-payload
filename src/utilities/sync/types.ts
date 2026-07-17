import { z } from 'zod'
import type { Product } from '@/payload-types'

// Validation schema for candle listings
export const CandleListingSchema = z.object({
  listing_id: z.number(),
  title: z.string().refine((val) => val.toLowerCase().includes('candle'), {
    message: "Listing title must contain the word 'candle' to be processed as a candle product.",
  }),
  description: z.string(),
  images: z.array(z.any()).optional(),
  // Guard the arithmetic the engine performs (amount / divisor): a malformed or
  // zero divisor from the API would otherwise write NaN/Infinity to price.
  price: z
    .object({
      amount: z.number(),
      divisor: z.number().positive(),
      currency_code: z.string(),
    })
    .optional(),
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
  { type: 'shop'; shopId: number; limit?: number } | { type: 'listings'; listingIds: number[] }

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
  etsyPrimaryImage?: number | string | null
  price?: number
  currency?: Product['currency']
  priceSyncedAt?: string
}

export interface ParsedEtsyDescription {
  // Optional so the engine can omit it entirely when empty — an empty array
  // written to Payload would wipe manually curated specification rows.
  specifications?: Array<{ label: string; value: string }>
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
  // `existing` (when provided) is the result of a prior findProductByEtsyId in the
  // same transaction, so the adapter can skip a duplicate existence query.
  upsertProduct(
    etsyListingId: number,
    data: ProductUpsertInput,
    existing?: { id: number | string } | null,
  ): Promise<number | string>
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
