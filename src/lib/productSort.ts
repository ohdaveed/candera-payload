export const PRODUCT_SORTS = ['newest', 'price-asc', 'price-desc'] as const
export type ProductSort = (typeof PRODUCT_SORTS)[number]

const SORT_FIELDS: Record<ProductSort, string> = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
}

function isProductSort(value: string): value is ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value)
}

/** Map a `?sort=` query value to a Payload sort field. Unknown values fall back to newest. */
export function resolveProductSort(sort?: string): string {
  if (sort !== undefined && isProductSort(sort)) {
    return SORT_FIELDS[sort]
  }
  return SORT_FIELDS.newest
}

/** Returns the sort value only if it is a non-default, known option (i.e. worth keeping in the URL). */
export function activeProductSort(sort?: string): ProductSort | null {
  if (sort !== undefined && sort !== 'newest' && isProductSort(sort)) {
    return sort
  }
  return null
}
