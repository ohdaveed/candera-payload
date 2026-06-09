'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

const TAGS = ['All', 'New Release', 'Bestseller', 'Limited Batch']
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
]

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? 'All'
  const activeSort = searchParams.get('sort') ?? 'newest'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if ((key === 'tag' && value === 'All') || value === 'newest') {
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-candera-stone/20">
      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => update('tag', tag)}
            className={cn(
              'text-[10px] font-bold uppercase tracking-[.25em] px-4 py-2 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
              activeTag === tag
                ? 'bg-candera-obsidian text-white'
                : 'border border-candera-stone/40 text-candera-sage-text hover:border-candera-obsidian hover:text-candera-obsidian',
            )}
          >
            {tag}
          </button>
        ))}
      </div>
      {/* Sort select */}
      <div className="flex flex-col gap-2">
        <label htmlFor="product-sort" className="sr-only">
          Sort products
        </label>
        <select
          id="product-sort"
          name="sort"
          value={activeSort}
          onChange={(e) => update('sort', e.target.value)}
          className="h-[44px] cursor-pointer border border-candera-stone/40 bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-candera-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
