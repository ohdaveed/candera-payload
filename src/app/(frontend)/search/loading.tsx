import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-candera-vellum">
      <div className="pt-32 pb-16 container">
        {/* Eyebrow skeleton */}
        <div className="flex justify-center mb-4">
          <Skeleton className="h-3 w-16 bg-candera-ash" />
        </div>
        {/* Heading skeleton */}
        <div className="flex justify-center mb-4">
          <Skeleton className="h-12 w-72 bg-candera-ash" />
        </div>
        {/* Subtext skeleton */}
        <div className="flex justify-center mb-12">
          <Skeleton className="h-4 w-80 bg-candera-ash" />
        </div>
        {/* Search input skeleton */}
        <div className="max-w-[560px] mx-auto mb-20">
          <Skeleton className="h-10 w-full bg-candera-ash" />
        </div>
      </div>
      {/* Results skeleton */}
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
