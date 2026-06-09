'use client'

import React, { useState } from 'react'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Section } from '@/components/ui/section'

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

  return (
    <Section padding="none" className="flex flex-col gap-16">
      {/* Large image */}
      <figure className="relative aspect-square overflow-hidden bg-candera-ash shadow-sm m-0">
        {activeImage && typeof activeImage !== 'string' ? (
          <MediaComponent fill imgClassName="object-cover" resource={activeImage} priority />
        ) : (
          <Section
            padding="none"
            className="flex h-full items-center justify-center text-candera-sage-text text-sm italic"
          >
            Image unavailable
          </Section>
        )}
      </figure>

      {/* Thumbnail row — only render if there are multiple images */}
      {allImages.length > 1 && (
        <Section
          as="nav"
          padding="none"
          className="flex flex-row flex-wrap gap-3"
          aria-label="Product image thumbnails"
        >
          {allImages.map((photo, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'w-16 h-16 relative overflow-hidden cursor-pointer bg-candera-ash shrink-0 transition-all duration-200',
                activeIndex === index
                  ? 'ring-1 ring-candera-obsidian'
                  : 'ring-1 ring-transparent opacity-70 hover:opacity-100',
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : 'false'}
            >
              {photo && typeof photo !== 'string' && (
                <MediaComponent fill imgClassName="object-cover" resource={photo} />
              )}
            </button>
          ))}
        </Section>
      )}
    </Section>
  )
}
