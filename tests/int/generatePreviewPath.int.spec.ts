import { describe, expect, it } from 'vite-plus/test'
import type { PayloadRequest } from 'payload'

import { generatePreviewPath } from '@/utilities/generatePreviewPath'

const fakeReq = {} as PayloadRequest

function extractPath(url: string | null): string | null {
  if (!url) return null
  const params = new URLSearchParams(url.split('?')[1] ?? '')
  return params.get('path')
}

describe('generatePreviewPath', () => {
  it('resolves products to the /products prefix', () => {
    const url = generatePreviewPath({ collection: 'products', slug: 'ember-vessel', req: fakeReq })
    expect(extractPath(url)).toBe('/products/ember-vessel')
  })

  it('resolves pages to the root prefix', () => {
    const url = generatePreviewPath({ collection: 'pages', slug: 'about', req: fakeReq })
    expect(extractPath(url)).toBe('/about')
  })

  it('resolves posts to the /posts prefix', () => {
    const url = generatePreviewPath({ collection: 'posts', slug: 'studio-notes', req: fakeReq })
    expect(extractPath(url)).toBe('/posts/studio-notes')
  })

  it('resolves how-to-guides to the /how-to prefix', () => {
    const url = generatePreviewPath({
      collection: 'how-to-guides',
      slug: 'trim-your-wick',
      req: fakeReq,
    })
    expect(extractPath(url)).toBe('/how-to/trim-your-wick')
  })

  it('returns null when slug is undefined or null', () => {
    expect(
      generatePreviewPath({
        collection: 'products',
        slug: undefined as unknown as string,
        req: fakeReq,
      }),
    ).toBeNull()
    expect(
      generatePreviewPath({
        collection: 'products',
        slug: null as unknown as string,
        req: fakeReq,
      }),
    ).toBeNull()
  })
})
