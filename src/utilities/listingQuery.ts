import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Sort, TypedCollectionSelect } from 'payload'

import { LISTING_PAGE_SIZE } from './listing'

/**
 * Collections with a paginated listing route. Kept narrow (rather than
 * `CollectionSlug`) so TypeScript can fully resolve the select-narrowed
 * return type — widen when a new listing route lands. Products keeps its
 * own `payload.find` calls (filter-aware query on the base route).
 */
type ListingCollection = 'posts' | 'how-to-guides'

/**
 * Shared paginated query for the listing routes (FE-02). Every listing pages
 * its collection in dozens, with depth-1 population and front-end access
 * control. Generic over `select` so the returned docs stay narrowed to the
 * selected fields, exactly like a direct `payload.find` call.
 */
export async function queryListingPage<
  TSlug extends ListingCollection,
  TSelect extends TypedCollectionSelect[TSlug],
>(args: { collection: TSlug; select: TSelect; page?: number; sort?: Sort }) {
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: args.collection,
    depth: 1,
    limit: LISTING_PAGE_SIZE,
    overrideAccess: false,
    page: args.page,
    select: args.select,
    sort: args.sort,
  })
}
