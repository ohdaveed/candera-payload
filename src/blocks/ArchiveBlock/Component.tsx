import type { Post, Product, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CardPostData } from '@/components/Card'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
  } = props

  const limit = limitFromProps || 3

  let data: (Post | Product)[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedDocs = await payload.find({
      collection: relationTo || 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    data = fetchedDocs.docs as (Post | Product)[]
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      data = filteredSelectedPosts
    }
  }

  return (
    <div id={`block-${id}`}>
      {introContent && (
        <div className="container mb-12">
          <RichText
            className="ms-0 max-w-[560px] 
              [&_h3]:h2 [&_h3]:mb-4
              [&_p]:editorial [&_p]:text-candera-sage-text"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive posts={data as CardPostData[]} relationTo={relationTo || 'products'} />
    </div>
  )
}
