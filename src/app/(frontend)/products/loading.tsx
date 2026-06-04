import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mb-20">
        <Skeleton className="h-4 w-24 mb-4 bg-candera-ash" />
        <Skeleton className="h-12 w-64 mb-6 bg-candera-ash" />
        <Skeleton className="h-4 w-96 bg-candera-ash" />
      </div>
      <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <Skeleton className="aspect-[4/5] w-full bg-candera-ash" />
            <Skeleton className="h-4 w-3/4 bg-candera-ash" />
            <Skeleton className="h-4 w-1/2 bg-candera-ash" />
          </div>
        ))}
      </div>
    </div>
  )
}
