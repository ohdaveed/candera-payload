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
    router.replace(nextUrl)
  }

  return (
    <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-6 border-b border-candera-stone/20 w-full">
      {/* Tag filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {['All', 'Bestseller', 'New Release', 'Limited Batch'].map((tag) => {
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => update('tag', tag)}
              className={`text-xs uppercase tracking-[.2em] font-bold py-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 border-b-2 cursor-pointer ${
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

      {/* Sort select */}
      <fieldset className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[180px] border-none p-0 m-0">
        <legend className="sr-only">Sort products</legend>
        <Select value={activeSort} onValueChange={(value) => update('sort', value)}>
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
