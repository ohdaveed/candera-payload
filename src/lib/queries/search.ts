// src/lib/queries/search.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Search } from '@/payload-types'

export async function searchContent(query: string): Promise<Search[]> {
  const q = query.trim()
  if (!q) return []

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    sort: ['-priority', '-createdAt'],
    where: {
      or: [
        { title: { contains: q } },
        { 'meta.description': { contains: q } },
        { 'meta.title': { contains: q } },
        { slug: { contains: q } },
      ],
    },
  })

  return docs
}
