import React from 'react'

export default function Loading() {
  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <div className="container">
        <div className="mb-20 max-w-[600px]">
          <div className="h-3 w-24 bg-candera-ash animate-pulse mb-4 rounded-none" />
          <div className="h-10 w-64 bg-candera-ash animate-pulse mb-6 rounded-none" />
          <div className="h-4 w-full bg-candera-ash animate-pulse rounded-none" />
          <div className="h-4 w-3/4 bg-candera-ash animate-pulse mt-2 rounded-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/5] w-full bg-candera-ash animate-pulse" />
              <div className="pt-6 flex flex-col gap-2">
                <div className="h-2.5 w-16 bg-candera-ash animate-pulse rounded-none" />
                <div className="h-5 w-40 bg-candera-ash animate-pulse rounded-none" />
                <div className="h-4 w-20 bg-candera-ash animate-pulse rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
