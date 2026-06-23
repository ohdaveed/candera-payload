import type { Media } from '@/payload-types'

/**
 * Extracts `url`/`alt` from a populated Meta/hero image field. Replaces the
 * repeated inline `typeof image === 'object' && 'url' in image` checks used in
 * the listing pages. Returns nulls when the field is unpopulated (an ID/string).
 */
export function getMetaImage(image: unknown): { url: string | null; alt: string | null } {
  if (image && typeof image === 'object') {
    const m = image as Partial<Media>
    return {
      url: typeof m.url === 'string' ? m.url : null,
      alt: typeof m.alt === 'string' ? m.alt : null,
    }
  }
  return { url: null, alt: null }
}
