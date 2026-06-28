import type { Product } from '@/payload-types'

const DEFAULT_CURRENCY = 'USD'

/**
 * Single source of truth for product price display.
 *
 * Formats a numeric price with `Intl.NumberFormat` so it renders flush (e.g.
 * `$38.00`) and respects the product's own `currency` field rather than assuming
 * USD. Centralised so every surface — PDP, sticky bar, cards — formats prices the
 * same way instead of hand-rolling `$${price.toFixed(2)}` and silently dropping
 * the configured currency.
 *
 * Client-safe: no server-only imports.
 */
export const formatPrice = (
  price: number | null | undefined,
  currency?: Product['currency'],
): string => {
  if (price == null || Number.isNaN(Number(price))) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? DEFAULT_CURRENCY,
  }).format(Number(price))
}
