'use client'

import React, { useState } from 'react'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Props = {
  // Ordered gallery: primary image first, then editor extras. Build with
  // `productGalleryPhotos` so the sync-owned primary and the gallery stay in sync.
  images: Media[]
}

export const ImageGallery: React.FC<Props> = ({ images }) => {
  const allImages = images ?? []

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = allImages[activeIndex] ?? null

  const thumbnails =
    allImages.length > 1 ? (
      <nav
        aria-label="Product image thumbnails"
        className={cn(
          'flex flex-row flex-wrap gap-2',
          // Desktop: absolute overlay at bottom-left of the figure
          'lg:absolute lg:bottom-5 lg:left-5 lg:z-10',
          // Mobile: normal flow below the image
          'mt-4 lg:mt-0',
        )}
      >
        {allImages.map((photo, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'w-14 h-14 relative overflow-hidden cursor-pointer bg-candera-ash shrink-0 transition-all duration-200',
              activeIndex === index
                ? 'ring-1 ring-candera-obsidian'
                : 'ring-1 ring-transparent opacity-60 hover:opacity-100',
            )}
            aria-label={`View image ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : 'false'}
          >
            {photo && typeof photo === 'object' && (
              <MediaComponent fill imgClassName="object-cover" resource={photo} />
            )}
          </button>
        ))}
      </nav>
    ) : null

  return (
    <div className="flex flex-col lg:h-full">
      {/* Large image — fills sticky column height on desktop */}
      <figure className="relative aspect-square lg:aspect-auto lg:flex-1 lg:h-full overflow-hidden bg-candera-ash shadow-sm m-0">
        {activeImage && typeof activeImage === 'object' ? (
          <MediaComponent fill imgClassName="object-cover" resource={activeImage} priority />
        ) : (
          <div className="absolute inset-0 flex items-end p-5 candle-bg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex flex-col items-center mb-[8%]">
                <div className="candle-flame" />
                <div className="candle-glow" />
                <div className="candle-wick" />
                <div className="candle-body" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 candle-floor-glow" />
          </div>
        )}
        {/* Thumbnails overlaid at bottom-left on desktop */}
        <div className="hidden lg:block">{thumbnails}</div>
      </figure>

      {/* Thumbnails below image on mobile */}
      <div className="lg:hidden">{thumbnails}</div>
    </div>
  )
}
