import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

afterEach(cleanup)

import { Pagination } from '@/components/Pagination'
import { activeProductSort, resolveProductSort } from '@/lib/productSort'

// Regression guard for FE-01 (tech-debt-remediation-2026-07-16): paginating a
// filtered/sorted collection must preserve the active `tag`/`sort` params.

describe('resolveProductSort', () => {
  it('maps known sorts to Payload sort fields', () => {
    expect(resolveProductSort('newest')).toBe('-createdAt')
    expect(resolveProductSort('price-asc')).toBe('price')
    expect(resolveProductSort('price-desc')).toBe('-price')
  })

  it('falls back to newest for missing or unknown values', () => {
    expect(resolveProductSort(undefined)).toBe('-createdAt')
    expect(resolveProductSort('bogus')).toBe('-createdAt')
  })
})

describe('activeProductSort', () => {
  it('returns non-default known sorts and null otherwise', () => {
    expect(activeProductSort('price-asc')).toBe('price-asc')
    expect(activeProductSort('newest')).toBeNull()
    expect(activeProductSort('bogus')).toBeNull()
    expect(activeProductSort(undefined)).toBeNull()
  })
})

describe('Pagination hrefs', () => {
  it('uses path-based routes when no query params are active', () => {
    render(React.createElement(Pagination, { basePath: '/products', page: 2, totalPages: 4 }))
    expect(screen.getByRole('link', { name: 'Go to next page' }).getAttribute('href')).toBe(
      '/products/page/3',
    )
    expect(screen.getByRole('link', { name: 'Go to previous page' }).getAttribute('href')).toBe(
      '/products/page/1',
    )
  })

  it('preserves active tag and sort in page links', () => {
    render(
      React.createElement(Pagination, {
        basePath: '/products',
        page: 2,
        totalPages: 4,
        query: { tag: 'Floral', sort: 'price-asc' },
      }),
    )
    expect(screen.getByRole('link', { name: 'Go to next page' }).getAttribute('href')).toBe(
      '/products?tag=Floral&sort=price-asc&page=3',
    )
    // Page 1 drops the page param but keeps the filters.
    expect(screen.getByRole('link', { name: 'Go to previous page' }).getAttribute('href')).toBe(
      '/products?tag=Floral&sort=price-asc',
    )
  })

  it('ignores undefined/empty query values, falling back to path routes', () => {
    render(
      React.createElement(Pagination, {
        basePath: '/products',
        page: 1,
        totalPages: 3,
        query: { tag: undefined, sort: '' },
      }),
    )
    expect(screen.getByRole('link', { name: 'Go to next page' }).getAttribute('href')).toBe(
      '/products/page/2',
    )
  })
})
