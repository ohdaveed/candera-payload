'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-candera-stone/20">
      {/* Tag pills */}
      <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
        {TAGS.map((tag) => (
          <li key={tag}>
            <Button
              variant={activeTag === tag ? 'cta' : 'outline'}
              onClick={() => update('tag', tag)}
              className={cn(
                'h-auto py-2.5 px-6 min-h-[44px]',
                activeTag !== tag &&
                  'border-candera-stone/40 text-candera-sage-text hover:border-candera-obsidian hover:text-candera-obsidian',
              )}
            >
              {tag}
            </Button>
          </li>
        ))}
      </ul>
      {/* Sort select */}
      <fieldset className="flex flex-col gap-2 min-w-[200px] border-none p-0 m-0">
        <legend className="sr-only">Sort products</legend>
        <Select value={activeSort} onValueChange={(value) => update('sort', value)}>
          <SelectTrigger
            id="product-sort"
            className="h-[44px] border-candera-stone/40 bg-transparent text-[10px] font-bold uppercase tracking-[.2em] text-candera-obsidian rounded-none focus:ring-candera-ember-strong/20"
          >
            <SelectValue placeholder="Sort Batch" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-candera-stone/20">
            {SORTS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className="text-[10px] font-bold uppercase tracking-[.1em]"
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
