'use client'

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

  return (
    <div className="flex flex-col gap-4">
      {/* Large image */}
      <div className="relative aspect-square overflow-hidden bg-candera-ash shadow-sm">
        {activeImage && typeof activeImage !== 'string' ? (
          <MediaComponent fill imgClassName="object-cover" resource={activeImage} priority />
        ) : (
          <div className="flex h-full items-center justify-center text-candera-sage-text text-sm italic">
            Image unavailable
          </div>
        )}
      </div>

      {/* Thumbnail row — only render if there are multiple images */}
      {allImages.length > 1 && (
        <div className="flex flex-row flex-wrap gap-2">
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
            >
              {photo && typeof photo !== 'string' && (
                <MediaComponent fill imgClassName="object-cover" resource={photo} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
