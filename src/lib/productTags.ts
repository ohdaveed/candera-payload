/**
 * Single source of truth for product tags.
 *
 * Consumed by the `productTag` select field in the Products collection
 * (`src/collections/Products.ts`) and by the storefront filter bar
 * (`src/app/(frontend)/products/ProductFilters.tsx`). Keeping both in sync
 * here prevents the filter UI from offering tags that don't exist on the
 * collection (Hick's Law — never surface a choice that dead-ends).
 *
 * This module must stay free of server-only imports so it can be used from
 * client components.
 */
export const PRODUCT_TAGS = ['Bestseller', 'New Release', 'Limited Batch'] as const

export type ProductTag = (typeof PRODUCT_TAGS)[number]
