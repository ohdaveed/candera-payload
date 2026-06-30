import 'server-only'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheTag } from 'next/cache'

export async function getRedirects(depth = 1) {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    depth,
    limit: 0,
    overrideAccess: false,
    pagination: false,
  })

  return redirects
}

/**
 * Returns a cached function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects = () => {
  return async () => {
    'use cache'
    cacheTag('redirects')
    return getRedirects()
  }
}
