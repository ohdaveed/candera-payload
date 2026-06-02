import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, relationTo = 'posts' } = props

  if (!posts || posts.length === 0) {
    return (
      <div className="container py-24 text-center flex flex-col items-center gap-4">
        <span className="eyebrow">Nothing here yet</span>
        <p className="editorial text-candera-sage-text max-w-[360px]">
          New batches are crafted on a slow schedule — check back soon.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-16 gap-x-6 lg:gap-x-10 xl:gap-x-12">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              const {
                slug,
                categories,
                meta,
                title,
                extraPhotos,
                scentProfile,
                burnTime,
                atmosphere,
                productTag,
                vessel,
                price,
              } = result

              const minimizedDoc = {
                slug,
                categories: categories?.map((cat) =>
                  typeof cat === 'object' ? { title: cat.title } : cat,
                ),
                meta: {
                  description: meta?.description,
                  image: meta?.image,
                },
                title,
                extraPhotos,
                scentProfile,
                burnTime,
                atmosphere,
                productTag,
                vessel,
                price,
              }

              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={minimizedDoc as CardPostData}
                    relationTo={relationTo}
                    showCategories
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
