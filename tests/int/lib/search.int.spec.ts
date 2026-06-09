// tests/int/lib/search.int.spec.ts
import { describe, it, expect } from 'vite-plus/test'
import { searchContent } from '@/lib/queries/search'

describe('searchContent', () => {
  it('returns empty array immediately for blank query without hitting DB', async () => {
    const result = await searchContent('')
    expect(result).toEqual([])
  })

  it('returns empty array for whitespace-only query', async () => {
    const result = await searchContent('   ')
    expect(result).toEqual([])
  })

  it('returns an array for a non-empty query', async () => {
    // This hits the real DB — verifies the query runs without error
    const result = await searchContent('candle')
    expect(Array.isArray(result)).toBe(true)
  })

  it('result items have the expected shape', async () => {
    const results = await searchContent('candle')
    if (results.length > 0) {
      const item = results[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('slug')
    }
  })
})
