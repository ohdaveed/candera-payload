'use client'
import { Suspense, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_TAGS } from '@/lib/productTags'

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
  const [isPending, startTransition] = useTransition()
  const activeSort = searchParams.get('sort') ?? 'newest'
  const activeTag = searchParams.get('tag') ?? 'All'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'sort' && value === 'newest') {
      params.delete(key)
    } else if (key === 'tag' && value === 'All') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    // Reset to page 1 when filter changes
    params.delete('page')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    // Doherty Threshold: surface a pending state while the server re-renders the
    // filtered collection so the interaction never feels unresponsive.
    // scroll: false keeps the user anchored to the collection instead of jumping
    // to the top on every filter change.
    startTransition(() => router.replace(nextUrl, { scroll: false }))
  }

  return (
    <nav
      aria-busy={isPending}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-6 border-b border-candera-stone/20 w-full"
    >
      {/* Tag filters */}
      <div
        className={`flex flex-wrap items-center gap-x-6 gap-y-3 transition-opacity duration-200 ${
          isPending ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {['All', ...PRODUCT_TAGS].map((tag) => {
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => update('tag', tag)}
              disabled={isPending}
              className={`text-xs uppercase tracking-[.2em] font-bold py-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 border-b-2 cursor-pointer disabled:cursor-default ${
                isActive
                  ? 'border-candera-ember-strong text-candera-obsidian'
                  : 'border-transparent text-candera-sage-text hover:text-candera-obsidian'
              }`}
            >
              {tag === 'All' ? 'All Editions' : tag}
            </button>
          )
        })}
      </div>

      {/* Sort select + pending indicator */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Doherty Threshold / visibility of system status. Persistent live region
            (kept in the DOM, only text swapped) for reliable polite announcements. */}
        <span
          role="status"
          aria-live="polite"
          className={`eyebrow text-candera-sage-text whitespace-nowrap transition-opacity duration-200 ${
            isPending ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isPending ? 'Updating…' : ''}
        </span>

        <fieldset className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px] border-none p-0 m-0">
          <legend className="sr-only">Sort products</legend>
          <Select
            value={activeSort}
            onValueChange={(value) => update('sort', value)}
            disabled={isPending}
          >
            <SelectTrigger
              id="product-sort"
              className="h-[40px] border-candera-stone/40 bg-transparent text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian rounded-none focus-visible:ring-candera-ember-strong/20"
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
      </div>
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
