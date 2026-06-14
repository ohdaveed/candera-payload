'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
]

function ProductFiltersFallback() {
  return (
    <div className="min-h-[44px] mb-12 pb-6 border-b border-candera-stone/20" aria-hidden="true" />
  )
}

function ProductFiltersInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSort = searchParams.get('sort') ?? 'newest'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset to page 1 when filter changes
    params.delete('page')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl)
  }

  return (
    <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-candera-stone/20">
      {/* Sort select */}
      <fieldset className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[200px] border-none p-0 m-0">
        <legend className="sr-only">Sort products</legend>
        <Select value={activeSort} onValueChange={(value) => update('sort', value)}>
          <SelectTrigger
            id="product-sort"
            className="h-[44px] border-candera-stone/40 bg-transparent text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian rounded-none focus-visible:ring-candera-ember-strong/20"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-candera-stone/20">
            {SORTS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className="text-xs font-bold uppercase tracking-[.1em]"
              >
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </fieldset>
    </nav>
  )
}

export function ProductFilters() {
  return (
    <Suspense fallback={<ProductFiltersFallback />}>
      <ProductFiltersInner />
    </Suspense>
  )
}
