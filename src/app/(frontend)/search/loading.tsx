import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mb-20">
        <Skeleton className="h-4 w-24 mb-4 bg-candera-ash" />
        <Skeleton className="h-12 w-64 mb-6 bg-candera-ash" />
        <Skeleton className="h-4 w-80 bg-candera-ash" />
      </div>
      <div className="container flex flex-col gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-6 items-start">
            <Skeleton className="w-24 h-24 shrink-0 bg-candera-ash" />
            <div className="flex flex-col gap-3 flex-1">
              <Skeleton className="h-5 w-3/4 bg-candera-ash" />
              <Skeleton className="h-4 w-full bg-candera-ash" />
              <Skeleton className="h-4 w-2/3 bg-candera-ash" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
