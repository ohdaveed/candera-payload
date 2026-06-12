// src/lib/queries/search.ts
import { sql } from '@/lib/db'

export type SearchResult = {
  id: number
  title: string | null
  slug: string | null
  meta_title: string | null
  meta_description: string | null
  meta_image_url: string | null
  meta_image_alt: string | null
  meta_image_width: number | null
  meta_image_height: number | null
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const escaped = query.trim().replace(/[%_\\]/g, '\\$&')
  const pattern = `%${escaped}%`

  const rows = await sql`
    SELECT
      s.id,
      s.title,
      s.slug,
      s.meta_title,
      s.meta_description,
      m.url   AS meta_image_url,
      m.alt   AS meta_image_alt,
      m.width::integer AS meta_image_width,
      m.height::integer AS meta_image_height
    FROM   search s
    LEFT JOIN media m ON s.meta_image_id = m.id
    WHERE  s.title            ILIKE ${pattern}
        OR s.meta_description ILIKE ${pattern}
        OR s.meta_title       ILIKE ${pattern}
        OR s.slug             ILIKE ${pattern}
    ORDER  BY s.priority DESC NULLS LAST, s.created_at DESC
    LIMIT  12
  `

  return rows as SearchResult[]
}
