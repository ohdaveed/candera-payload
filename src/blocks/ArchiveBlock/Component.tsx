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

  const isPosts = relationTo === 'posts'

  return (
    <Section id={`block-${id}`} padding="none" className="my-16 md:my-24">
      {isPosts ? (
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-12">
            {/* Left — sticky editorial sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col gap-4">
                {serializedIntroContent && (
                  <RichText
                    className="ms-0
                      [&_h3]:h2 [&_h3]:mb-4
                      [&_p]:editorial [&_p]:text-candera-sage-text"
                    data={serializedIntroContent}
                    enableGutter={false}
                  />
                )}
              </div>
            </div>

            {/* Right — 3-column card grid */}
            <div className="lg:col-span-3">
              <CollectionArchive posts={data as CardPostData[]} relationTo="posts" hideSidebar />
            </div>
          </div>
        </Container>
      ) : (
        <Container>
          <CollectionArchive posts={data as CardPostData[]} relationTo={relationTo || 'products'} />
        </Container>
      )}
    </Section>
  )
}
