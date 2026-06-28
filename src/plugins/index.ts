import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { redirectRevalidateHooks } from '@/utilities/revalidate'
import {
  GenerateDescription,
  GenerateImage,
  GenerateTitle,
  GenerateURL,
} from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { processFormSubmission } from '@/hooks/formSubmissions/processSubmission'
import { validateSubmission } from '@/hooks/formSubmissions/validateSubmission'
import { revalidateForm, revalidateFormOnDelete } from '@/hooks/forms/revalidateForm'

// Recursively extracts plain text from a Payload Lexical rich-text value.
function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const node = value as Record<string, unknown>
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
  if (Array.isArray(node.children)) {
    return (node.children as unknown[]).map(lexicalToPlainText).join(' ')
  }
  if (node.root) return lexicalToPlainText(node.root)
  return ''
}

const generateTitle: GenerateTitle<Post | Page | Product> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Candera Candles` : 'Candera Candles'
}

// Collection-aware so the SEO preview/canonical points at the real route:
// products → /products/[slug], posts → /posts/[slug], pages → /[slug].
const generateURL: GenerateURL<Post | Page | Product> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url

  const prefix =
    collectionSlug === 'products' ? '/products' : collectionSlug === 'posts' ? '/posts' : ''
  return `${url}${prefix}/${doc.slug}`
}

// Generates a meta description from clean product copy or post content.
// Products: tagline + parsed description (≤155 chars). Posts/Pages: empty
// so the editor's own meta.description field is used unmodified.
const generateDescription: GenerateDescription<Post | Page | Product> = ({
  doc,
  collectionSlug,
}) => {
  if (collectionSlug === 'products') {
    const product = doc as Product
    const tagline = product?.tagline ?? ''
    const body = lexicalToPlainText(product?.description).replace(/\s+/g, ' ').trim()
    const combined = tagline ? `${tagline}. ${body}` : body
    return combined.slice(0, 155)
  }
  return ''
}

// Picks the primary image for OG/Twitter cards.
// Products: sync-owned etsyPrimaryImage. Posts: heroImage. Pages: nothing.
const generateImage: GenerateImage<Post | Page | Product> = ({ doc, collectionSlug }) => {
  if (collectionSlug === 'products') {
    const product = doc as Product
    const img = product?.etsyPrimaryImage
    if (img) return typeof img === 'object' ? (img as { id: string | number }).id : img
  }
  if (collectionSlug === 'posts') {
    const post = doc as Post
    const img = post?.heroImage
    if (img) return typeof img === 'object' ? (img as { id: string | number }).id : img
  }
  return null
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: {
        group: 'System',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [redirectRevalidateHooks.afterChange],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${(doc.slug as string) || ''}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateDescription,
    generateImage,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        group: 'Inquiries',
      },
      hooks: {
        afterChange: [revalidateForm],
        afterDelete: [revalidateFormOnDelete],
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Inquiries',
      },
      hooks: {
        beforeValidate: [validateSubmission],
        afterChange: [processFormSubmission],
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'products'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
