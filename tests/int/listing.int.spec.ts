import { describe, expect, it } from 'vitest'

import { listingMetadata, pagedListingMetadata, resolvePageParam } from '@/utilities/listing'

// Guards for the shared listing-route plumbing (FE-02) — the page-param
// semantics must stay identical to the products reference implementation.

describe('resolvePageParam', () => {
  it('404s non-integer or sub-1 page params', () => {
    for (const bad of ['abc', '1.5', '0', '-2', 'NaN', '']) {
      expect(resolvePageParam(bad, '/posts')).toEqual({ kind: 'not-found' })
    }
  })

  it('redirects page 1 (including alternate spellings) to the base route', () => {
    expect(resolvePageParam('1', '/posts')).toEqual({ kind: 'redirect', to: '/posts' })
    expect(resolvePageParam('01', '/how-to')).toEqual({ kind: 'redirect', to: '/how-to' })
  })

  it('redirects alternate integer spellings to the canonical page URL', () => {
    expect(resolvePageParam('02', '/products')).toEqual({
      kind: 'redirect',
      to: '/products/page/2',
    })
    expect(resolvePageParam('2e0', '/products')).toEqual({
      kind: 'redirect',
      to: '/products/page/2',
    })
  })

  it('accepts canonical page numbers of 2 and up', () => {
    expect(resolvePageParam('2', '/how-to')).toEqual({ kind: 'page', page: 2 })
    expect(resolvePageParam('17', '/posts')).toEqual({ kind: 'page', page: 17 })
  })
})

describe('listingMetadata', () => {
  it('builds the base-route metadata with a base canonical', () => {
    const meta = listingMetadata({
      titlePrefix: 'Journal',
      description: 'Stories from the studio.',
      basePath: '/posts',
    })

    expect(meta.title).toBe('Journal — Candera')
    expect(meta.description).toBe('Stories from the studio.')
    expect(meta.alternates?.canonical).toBe('/posts')
    expect(meta.openGraph).toMatchObject({ title: 'Journal — Candera', type: 'website' })
  })
})

describe('pagedListingMetadata', () => {
  it('builds paged metadata with a self-referencing canonical', () => {
    const meta = pagedListingMetadata({
      titlePrefix: 'Collection',
      description: 'Browse the collection.',
      basePath: '/products',
      pageNumber: '3',
    })

    expect(meta.title).toBe('Collection — Page 3 — Candera')
    expect(meta.alternates?.canonical).toBe('/products/page/3')
  })

  it('normalizes alternate integer spellings in the canonical', () => {
    const meta = pagedListingMetadata({
      titlePrefix: 'Collection',
      description: 'Browse the collection.',
      basePath: '/products',
      pageNumber: '02',
    })

    expect(meta.title).toBe('Collection — Page 2 — Candera')
    expect(meta.alternates?.canonical).toBe('/products/page/2')
  })
})
