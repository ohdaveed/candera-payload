import { describe, expect, it } from 'vite-plus/test'

import { ETSY_SHOP_URL, etsyListingUrl } from '@/lib/etsy'

describe('etsyListingUrl', () => {
  it('builds a listing URL for a real (large) Etsy listing ID', () => {
    expect(etsyListingUrl(4451037505)).toBe('https://www.etsy.com/listing/4451037505')
  })

  it('falls back to the shop page for seed/placeholder IDs that are not real listings', () => {
    // Seed data uses tiny placeholder IDs (1001–1006, 999901) that would 404 on Etsy.
    for (const placeholder of [1001, 1002, 1003, 1004, 1005, 1006, 999901]) {
      expect(etsyListingUrl(placeholder)).toBe(ETSY_SHOP_URL)
    }
  })

  it('falls back to the shop page for missing or malformed IDs', () => {
    expect(etsyListingUrl(null)).toBe(ETSY_SHOP_URL)
    expect(etsyListingUrl(undefined)).toBe(ETSY_SHOP_URL)
    expect(etsyListingUrl(0)).toBe(ETSY_SHOP_URL)
    expect(etsyListingUrl(-4451037505)).toBe(ETSY_SHOP_URL)
    expect(etsyListingUrl(NaN)).toBe(ETSY_SHOP_URL)
    expect(etsyListingUrl(123.45)).toBe(ETSY_SHOP_URL)
  })
})
