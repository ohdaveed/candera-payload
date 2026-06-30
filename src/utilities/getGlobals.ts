import 'server-only'
import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { cacheTag } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    overrideAccess: false,
  })

  return global
}

/**
 * Returns a cached function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) => {
  return async () => {
    'use cache'
    cacheTag(`global_${slug}`)
    return getGlobal<T>(slug, depth)
  }
}
