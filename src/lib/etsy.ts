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

export const etsyListingUrl = (id?: number | null): string =>
  id ? `https://www.etsy.com/listing/${id}` : ETSY_SHOP_URL
