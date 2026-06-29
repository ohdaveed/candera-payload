# Workflow and Frontend Hooks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement React hooks for frontend UX, Payload CMS hooks for backend automation, and Git hooks for developer workflow automation.

**Architecture:** We will set up Husky and lint-staged for developer experience. Then we will add custom React hooks for debounce and intersection observer. Finally, we'll implement slug generation and Next.js revalidation hooks for the Products collection in Payload CMS.

**Tech Stack:** Next.js 16, React 19, Payload CMS 3, Husky, Vitest, TypeScript

---

### Task 1: Setup Husky & Lint-Staged

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`
- Modify: `package.json`

**Step 1: Write the failing test (or manual check)**

Run: `git commit -m "test: verify hooks"`
Expected: No hooks run since Husky isn't configured yet.

**Step 2: Write minimal implementation**

```bash
# In terminal
pnpm add -D husky lint-staged
pnpm exec husky init
```

Modify `package.json` to include lint-staged config:
```json
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "vp lint --fix"
    ]
  }
```

Update `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Update `.husky/pre-push`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm run test:int
```

**Step 3: Run test to verify it passes**

Run: `git add package.json && git commit -m "chore: setup husky"`
Expected: PASS, lint-staged runs `vp lint`.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .husky/
git commit -m "chore: setup husky and lint-staged for git hooks"
```

---

### Task 2: Implement React Hooks (`useDebounce`)

**Files:**
- Create: `src/app/(frontend)/hooks/useDebounce.ts`
- Create: `tests/int/hooks/useDebounce.int.spec.ts`

**Step 1: Write the failing test**

```typescript
// tests/int/hooks/useDebounce.int.spec.ts
import { renderHook, act } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { useDebounce } from '@/app/(frontend)/hooks/useDebounce'

test('should debounce value updates', () => {
  vi.useFakeTimers()
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
    initialProps: { value: 'initial' }
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
```

**Step 2: Run test to verify it fails**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/hooks/useDebounce.int.spec.ts`
Expected: FAIL with "module not found"

**Step 3: Write minimal implementation**

```typescript
// src/app/(frontend)/hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/hooks/useDebounce.int.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/\(frontend\)/hooks/useDebounce.ts tests/int/hooks/useDebounce.int.spec.ts
git commit -m "feat: add useDebounce react hook"
```

---

### Task 3: Implement React Hooks (`useIntersectionObserver`)

**Files:**
- Create: `src/app/(frontend)/hooks/useIntersectionObserver.ts`
- Create: `tests/int/hooks/useIntersectionObserver.int.spec.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/hooks/useIntersectionObserver.int.spec.ts`
Expected: FAIL with "module not found"

**Step 3: Write minimal implementation**

```typescript
// src/app/(frontend)/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react'

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: Args = {}) {
  const ref = useRef<Element | null>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = ref?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref?.current, JSON.stringify(threshold), root, rootMargin, frozen])

  return { ref, entry, isIntersecting: !!entry?.isIntersecting }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/hooks/useIntersectionObserver.int.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/\(frontend\)/hooks/useIntersectionObserver.ts tests/int/hooks/useIntersectionObserver.int.spec.ts
git commit -m "feat: add useIntersectionObserver react hook"
```

---

### Task 4: Implement Payload Hooks (Revalidate on Product Change)

**Files:**
- Create: `src/collections/Products/hooks/revalidateProduct.ts`
- Modify: `src/collections/Products.ts`

**Step 1: Write the failing test**

```typescript
// tests/int/collections/Products/revalidate.int.spec.ts
import { expect, test, vi } from 'vitest'
import { revalidateProduct } from '@/collections/Products/hooks/revalidateProduct'
import { revalidateTag } from 'next/cache'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

test('revalidateProduct should call revalidateTag', () => {
  const doc = { slug: 'test-product' }
  revalidateProduct({ doc, previousDoc: { slug: 'old-slug' }, operation: 'update' } as any)
  expect(revalidateTag).toHaveBeenCalledWith('products_test-product')
  expect(revalidateTag).toHaveBeenCalledWith('products_old-slug')
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/collections/Products/revalidate.int.spec.ts`
Expected: FAIL with "module not found"

**Step 3: Write minimal implementation**

```typescript
// src/collections/Products/hooks/revalidateProduct.ts
import { CollectionAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateProduct: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
}) => {
  if (operation === 'update' || operation === 'create') {
    if (doc.slug) {
      revalidateTag(`products_${doc.slug}`)
    }
    if (previousDoc && previousDoc.slug && previousDoc.slug !== doc.slug) {
      revalidateTag(`products_${previousDoc.slug}`)
    }
  }
  return doc
}
```

Modify `src/collections/Products.ts`:
Add to hooks array:
```typescript
  hooks: {
    afterChange: [revalidateProduct], // Ensure to import revalidateProduct
  },
```

**Step 4: Run test to verify it passes**

Run: `pnpm vp test run --config ./vitest.config.mts tests/int/collections/Products/revalidate.int.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/collections/Products/hooks/revalidateProduct.ts src/collections/Products.ts tests/int/collections/Products/revalidate.int.spec.ts
git commit -m "feat: add afterChange revalidation hook for Products"
```
