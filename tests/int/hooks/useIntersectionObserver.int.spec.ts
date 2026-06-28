// tests/int/hooks/useIntersectionObserver.int.spec.ts
import 'dotenv/config'
import { renderHook } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'
import { useIntersectionObserver } from '@/app/(frontend)/hooks/useIntersectionObserver'

// Note: Requires mocking IntersectionObserver for jsdom
test('should return intersection state', () => {
  const { result } = renderHook(() => useIntersectionObserver({}))
  expect(result.current.isIntersecting).toBe(false)
  expect(typeof result.current.ref).toBe('function')
})
