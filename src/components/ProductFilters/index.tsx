'use client'
import React, { useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { Card, CardPostData } from '@/components/Card'

type ProductDoc = {
  id: string | number
  slug: string
  title: string
  extraPhotos?: any
  scentProfile?: any
  burnTime?: string | null
  atmosphere?: string | null
  productTag?: string | null
  vessel?: string | null
  price?: number | null
  tagline?: string | null
}

type Props = {
  products: ProductDoc[]
}

const TAG_OPTIONS = ['All', 'Limited Batch', 'Bestseller', 'New Release'] as const
const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price ↑', value: 'price-asc' },
  { label: 'Price ↓', value: 'price-desc' },
] as const

export const ProductFilters: React.FC<Props> = ({ products }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTag = searchParams.get('tag') || 'All'
  const activeSort = searchParams.get('sort') || ''

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (activeTag !== 'All') {
      list = list.filter((p) => p.productTag === activeTag)
    }
    if (activeSort === 'price-asc') {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (activeSort === 'price-desc') {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }
    return list
  }, [products, activeTag, activeSort])

  const isFiltered = activeTag !== 'All' || activeSort !== ''
  const featured = !isFiltered && filtered.length > 0 ? filtered[0] : null
  const remaining = !isFiltered && filtered.length > 0 ? filtered.slice(1) : filtered

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-6 mb-16 pb-8 border-b border-candera-stone/20">
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setParam('tag', tag === 'All' ? '' : tag)}
              className={cn(
                'text-[10px] font-bold uppercase tracking-[.2em] px-4 py-2 border transition-colors duration-200',
                activeTag === tag
                  ? 'bg-candera-obsidian text-white border-candera-obsidian'
                  : 'bg-transparent text-candera-sage-text border-candera-stone/40 hover:border-candera-obsidian hover:text-candera-obsidian',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam('sort', opt.value)}
              className={cn(
                'text-[10px] font-bold uppercase tracking-[.2em] px-4 py-2 border transition-colors duration-200',
                activeSort === opt.value
                  ? 'bg-candera-obsidian text-white border-candera-obsidian'
                  : 'bg-transparent text-candera-sage-text border-candera-stone/40 hover:border-candera-obsidian hover:text-candera-obsidian',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center flex flex-col items-center gap-4">
          <span className="eyebrow">No matches</span>
          <p className="editorial text-candera-sage-text">
            No candles match the current filter — try a different batch status.
          </p>
        </div>
      )}

      {/* Featured first product when no filter active */}
      {featured && (
        <Link
          href={`/products/${featured.slug}`}
          className="group grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-24 items-center"
        >
          <div className="lg:col-span-7 relative aspect-[4/5] overflow-hidden bg-candera-ash">
            {featured.extraPhotos && featured.extraPhotos.length > 0 && typeof featured.extraPhotos[0] !== 'string' ? (
              <Media
                fill
                imgClassName="object-cover transition-transform duration-1000 group-hover:scale-105"
                resource={featured.extraPhotos[0]}
                size="60vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-candera-sage-text text-sm italic">
                Image unavailable
              </div>
            )}
            {featured.productTag && (
              <div className="absolute top-6 left-6 z-10">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[.25em] px-4 py-2',
                    featured.productTag === 'Limited Batch' && 'bg-candera-ember-strong text-white',
                    featured.productTag === 'Bestseller' && 'bg-candera-obsidian text-white',
                    featured.productTag === 'New Release' && 'bg-candera-stone text-candera-obsidian',
                  )}
                  aria-label={featured.productTag}
                >
                  {featured.productTag}
                </span>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-5">
            {featured.vessel && (
              <span className="eyebrow">Vessel {featured.vessel}</span>
            )}
            <h2 className="hero-heading text-candera-obsidian group-hover:text-candera-ember-strong transition-colors">
              {featured.title}
            </h2>
            {featured.tagline && (
              <p className="editorial text-[18px] text-candera-sage-text">{featured.tagline}</p>
            )}
            {featured.price != null && (
              <span className="price text-[22px]">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(featured.price))}
              </span>
            )}
            <div className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.3em] text-candera-ember-strong group-hover:text-candera-ember transition-colors">
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Regular grid */}
      {remaining.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {remaining.map((product) => (
            <Card
              key={product.id}
              doc={{
                slug: product.slug,
                title: product.title,
                extraPhotos: product.extraPhotos,
                scentProfile: product.scentProfile,
                burnTime: product.burnTime,
                atmosphere: product.atmosphere,
                productTag: product.productTag,
                vessel: product.vessel,
                price: product.price,
              } as CardPostData}
              relationTo="products"
            />
          ))}
        </div>
      )}
    </div>
  )
}
