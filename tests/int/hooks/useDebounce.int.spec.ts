import { renderHook, act } from '@testing-library/react'
import { expect, test, vi } from 'vite-plus/test'
import { useDebounce } from '@/app/(frontend)/hooks/useDebounce'

test('should debounce value updates', () => {
  vi.useFakeTimers()
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
    initialProps: { value: 'initial' },
  })

  expect(result.current).toBe('initial')

  rerender({ value: 'updated' })
  expect(result.current).toBe('initial') // Should not update immediately

  act(() => {
    vi.advanceTimersByTime(500)
  })

  expect(result.current).toBe('updated') // Should update after delay
  vi.useRealTimers()
})
