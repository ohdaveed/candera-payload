import React from 'react'

export default function Loading() {
  return (
    <div className="pt-32 pb-24 bg-candera-linen min-h-screen">
      <div className="container mb-20">
        <div className="max-w-[560px]">
          <div className="h-3 w-28 bg-candera-ash animate-pulse mb-4 rounded-none" />
          <div className="h-10 w-56 bg-candera-ash animate-pulse mb-6 rounded-none" />
          <div className="h-4 w-full bg-candera-ash animate-pulse rounded-none" />
          <div className="h-4 w-4/5 bg-candera-ash animate-pulse mt-2 rounded-none" />
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-16 gap-x-6 lg:gap-x-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-span-4 flex flex-col">
              <div className="aspect-[4/5] w-full bg-candera-ash animate-pulse" />
              <div className="pt-6 flex flex-col gap-2">
                <div className="h-2.5 w-20 bg-candera-ash animate-pulse rounded-none" />
                <div className="h-5 w-48 bg-candera-ash animate-pulse rounded-none" />
                <div className="h-4 w-full bg-candera-ash animate-pulse rounded-none mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
