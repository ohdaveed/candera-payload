import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utilities/ui'
import { Card, CardContent } from '@/components/ui/card'

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'flex flex-col h-full bg-candera-linen rounded-none border-none shadow-none',
        className,
      )}
    >
      <Skeleton className="aspect-[4/5] w-full bg-candera-ash rounded-none" />
      <CardContent className="pt-6 pb-2 flex flex-col flex-grow p-0">
        <div className="flex items-start justify-between gap-4 mb-3 px-4">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-3 w-16 bg-candera-ash" />
            <Skeleton className="h-6 w-3/4 bg-candera-ash" />
          </div>
          <Skeleton className="h-5 w-12 bg-candera-ash shrink-0 mt-4" />
        </div>
        <div className="mt-auto pt-4 border-t border-candera-stone/20 px-4">
          <Skeleton className="h-3 w-24 bg-candera-ash mb-4" />
          <div className="grid grid-cols-3 gap-2 pb-4">
            <Skeleton className="h-8 w-full bg-candera-ash" />
            <Skeleton className="h-8 w-full bg-candera-ash" />
            <Skeleton className="h-8 w-full bg-candera-ash" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
