/**
 * Single source of truth for Etsy links.
 *
 * `ETSY_SHOP_URL` is the storefront fallback used when a product has no specific
 * listing ID — every "Buy on Etsy" CTA resolves to either a real listing or the
 * real shop, so the link always works. Centralised here so the shop slug lives in
 * one place instead of being duplicated (and drifting) across CTA components and
 * structured data.
 *
 * Client-safe: no server-only imports.
 */
export const ETSY_SHOP_URL = 'https://www.etsy.com/shop/CanderaCandles'

/**
 * Smallest value we treat as a real Etsy listing ID.
 *
 * Etsy listing IDs are large, monotonically-growing integers — current IDs are
 * ~10 digits (in the billions). Seed/placeholder products in this codebase use
 * tiny stand-in IDs (e.g. 1002–1006, 999901), which would otherwise render as
 * `https://www.etsy.com/listing/1003` and 404. Anything below this threshold is
 * therefore not a real listing and is sent to the shop page instead, so no
 * "Buy on Etsy" link can land on a dead listing. The 8-digit floor leaves a
 * wide margin between known placeholders (≤ 6 digits) and real IDs (≥ 9 digits).
 */
export const MIN_REAL_ETSY_LISTING_ID = 10_000_000

export const etsyListingUrl = (id?: number | null): string =>
  typeof id === 'number' && Number.isInteger(id) && id >= MIN_REAL_ETSY_LISTING_ID
    ? `https://www.etsy.com/listing/${id}`
    : ETSY_SHOP_URL
