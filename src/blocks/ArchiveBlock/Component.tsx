import type { Post, Product, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CardPostData } from '@/components/Card'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

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
  let totalDocs = 0

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
    totalDocs = fetchedDocs.totalDocs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      data = filteredSelectedPosts
      totalDocs = data.length
    }
  }

  // Support dynamic count interpolation in intro content
  const serializedIntroContent = introContent ? JSON.parse(JSON.stringify(introContent)) : null
  if (serializedIntroContent?.root?.children) {
    const traverseAndReplace = (node: unknown) => {
      if (typeof node !== 'object' || node === null) return
      const n = node as Record<string, unknown>
      if (typeof n.text === 'string') {
        n.text = n.text.replace('{{count}}', totalDocs.toString())
      }
      if (Array.isArray(n.children)) {
        n.children.forEach(traverseAndReplace)
      }
    }
    traverseAndReplace(serializedIntroContent.root)
  }

  return (
    <Section id={`block-${id}`} padding="none" className="my-16 md:my-24">
      {/* Only show introContent for posts (blog) — products use the CollectionArchive sidebar */}
      {serializedIntroContent && relationTo !== 'products' && (
        <Container className="mb-12">
          <RichText
            className="ms-0 max-w-[560px]
              [&_h3]:h2 [&_h3]:mb-4
              [&_p]:editorial [&_p]:text-candera-sage-text"
            data={serializedIntroContent}
            enableGutter={false}
          />
        </Container>
      )}
      <Container>
        <CollectionArchive posts={data as CardPostData[]} relationTo={relationTo || 'products'} />
      </Container>
    </Section>
  )
}
