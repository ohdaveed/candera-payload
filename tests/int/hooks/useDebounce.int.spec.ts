import 'dotenv/config'
import { renderHook, act } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { useDebounce } from '@/app/(frontend)/hooks/useDebounce'

// Restore real timers even if an assertion throws mid-test, so a failure here
// can't bleed fake timers into later tests.
afterEach(() => {
  vi.useRealTimers()
})

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
})
