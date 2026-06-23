/**
 * Single source of truth for the public Etsy URLs used by the storefront's
 * "Buy on Etsy" links.
 *
 * Centralising this keeps the three product-page entry points (product detail
 * CTA, sticky CTA bar, and the card quick-view dialog) from drifting apart and
 * guarantees every rendered link points somewhere real.
 */

/** Public storefront page for the Candera Etsy shop. */
export const ETSY_SHOP_URL = 'https://www.etsy.com/shop/candera'

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

/**
 * Builds the public "Buy on Etsy" URL for a product.
 *
 * Etsy listing pages live at `https://www.etsy.com/listing/{listingId}`. The
 * bare-ID form 301-redirects to the canonical slugged URL, so it is safe (and
 * stable) to link to without knowing the slug.
 *
 * Falls back to the shop page when the listing ID is missing, malformed, or too
 * small to be a real Etsy listing, so the button can never render a broken
 * `/listing/null`, `/listing/0`, or `/listing/1003` link.
 */
export function etsyListingUrl(listingId: number | null | undefined): string {
  return typeof listingId === 'number' &&
    Number.isInteger(listingId) &&
    listingId >= MIN_REAL_ETSY_LISTING_ID
    ? `https://www.etsy.com/listing/${listingId}`
    : ETSY_SHOP_URL
}
