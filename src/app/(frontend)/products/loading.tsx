import { Skeleton } from '@/components/ui/skeleton'
import { ProductCardSkeleton } from './ProductCardSkeleton'

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="pt-32 pb-32 bg-candera-vellum">
      <div className="container mb-20">
        <Skeleton className="h-4 w-24 mb-4 bg-candera-ash" />
        <Skeleton className="h-12 w-64 mb-6 bg-candera-ash" />
        <Skeleton className="h-4 w-96 bg-candera-ash" />
      </div>

      <div className="container mb-12 pb-6 border-b border-candera-stone/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-[44px] w-24 bg-candera-ash" />
            <Skeleton className="h-[44px] w-24 bg-candera-ash" />
            <Skeleton className="h-[44px] w-24 bg-candera-ash" />
          </div>
          <Skeleton className="h-[44px] w-32 bg-candera-ash" />
        </div>
      </div>

      <div className="container">
        <Skeleton className="h-4 w-48 mb-8 bg-candera-ash" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
