// tests/int/hooks/useIntersectionObserver.int.spec.ts
import { renderHook } from '@testing-library/react'
import { expect, test } from 'vitest'
import { useIntersectionObserver } from '@/app/(frontend)/hooks/useIntersectionObserver'

// Note: Requires mocking IntersectionObserver for jsdom
test('should return intersection state', () => {
  const { result } = renderHook(() => useIntersectionObserver({}))
  expect(result.current.isIntersecting).toBe(false)
  expect(result.current.ref.current).toBe(null)
})
