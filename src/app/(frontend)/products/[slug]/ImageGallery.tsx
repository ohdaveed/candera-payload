'use client'

import React, { useState } from 'react'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Props = {
  mainImage: Media | string | null | undefined
  extraPhotos?: (Media | string)[] | null
}

export const ImageGallery: React.FC<Props> = ({ mainImage, extraPhotos }) => {
  // extraPhotos already contains mainImage as its first entry,
  // so use extraPhotos as the full list when available; otherwise fall back to mainImage alone.
  const allImages: (Media | string)[] =
    extraPhotos && extraPhotos.length > 0 ? extraPhotos : mainImage ? [mainImage] : []

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
            {photo && typeof photo !== 'string' && (
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
        {activeImage && typeof activeImage !== 'string' ? (
          <MediaComponent fill imgClassName="object-cover" resource={activeImage} priority />
        ) : (
          <div className="flex h-full items-center justify-center text-candera-sage-text text-sm italic">
            Image unavailable
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
