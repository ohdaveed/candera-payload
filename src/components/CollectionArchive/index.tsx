import React from 'react'

import { Card, CardPostData } from '@/components/Card'
import { Container } from '@/components/ui/container'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, relationTo = 'posts' } = props

  return (
    <Container>
      <div className="flex flex-wrap justify-center gap-y-16 gap-x-6 lg:gap-x-10 xl:gap-x-12">
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            const {
              slug,
              categories,
              meta,
              title,
              tagline,
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
              tagline,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
            }

            return (
              <div
                className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] xl:w-[calc(33.333%-3rem)]"
                key={index}
              >
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
    </Container>
  )
}
