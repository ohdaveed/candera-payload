import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  pathPrefix?: string
}): Promise<Metadata> => {
  const { doc, pathPrefix } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Append the brand suffix only when it isn't already part of the title,
  // so titles like "Candera Candles | Botanical Scent Studio" don't become
  // "... | Botanical Scent Studio | Candera".
  const withBrand = (value: string) => (/candera/i.test(value) ? value : `${value} | Candera`)

  const rawTitle =
    doc?.meta?.title || (doc as { title?: string })?.title || 'Candera | Botanical Scent Studio'
  const title = withBrand(rawTitle)

  const description = doc?.meta?.description || (doc as { tagline?: string })?.tagline

  const slugPath = Array.isArray(doc?.slug) ? doc.slug.join('/') : (doc?.slug ?? '/')
  const normalizedPrefix = pathPrefix ? `/${pathPrefix.replace(/^\/|\/$/g, '')}` : ''
  const canonical =
    slugPath === 'home' && !normalizedPrefix ? '/' : `${normalizedPrefix}/${slugPath}`

  return {
    description,
    alternates: { canonical },
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonical,
    }),
    title,
  }
}
