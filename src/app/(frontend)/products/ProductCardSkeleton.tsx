import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utilities/ui'

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col h-full bg-candera-linen', className)}>
      <Skeleton className="aspect-[4/5] w-full bg-candera-ash rounded-none" />
      <div className="pt-6 pb-2 flex flex-col flex-grow p-0">
        <div className="flex items-start justify-between gap-4 mb-3 px-4">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-3 w-16 bg-candera-ash" />
            <Skeleton className="h-6 w-3/4 bg-candera-ash" />
          </div>
          <Skeleton className="h-5 w-12 bg-candera-ash shrink-0 mt-4" />
        </div>
        <div className="mt-auto pt-4 pb-4 border-t border-candera-stone/20 px-4">
          {/* Mirrors the classic card's inline "Scent" label + pill row */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-10 bg-candera-ash shrink-0" />
            <Skeleton className="h-5 w-16 bg-candera-ash" />
            <Skeleton className="h-5 w-16 bg-candera-ash" />
            <Skeleton className="h-5 w-14 bg-candera-ash" />
          </div>
        </div>
      </div>
    </div>
  )
}
