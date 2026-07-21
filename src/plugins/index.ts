import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import * as Sentry from '@sentry/nextjs'
import { CollectionConfig, Plugin } from 'payload'
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
  return ''
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: {
        group: 'System',
        description:
          'URL redirect rules for retired or renamed Pages/Posts URLs. Applied automatically.',
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
        description:
          'Form definitions used by storefront forms like Contact. Submissions are stored separately in Form Submissions.',
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
        description:
          'Inquiries received through storefront forms. Entries are created by visitors, not edited here.',
      },
      access: {
        // Storefront submissions go through the server action with overrideAccess.
        create: () => false,
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
      admin: {
        description:
          "Auto-generated search index built from published Posts and Products. Don't edit directly.",
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // MCP server (mounted at POST /api/mcp). Two gates protect every operation:
  //   1. This config declares which collections/globals expose MCP tools at all.
  //   2. Each API key then allows/disallows those ops via per-key checkboxes.
  // Sensitive collections (users, etsy-tokens, form-submissions, payload-mcp-api-keys,
  // search, and all payload-* internals) are intentionally omitted, so no MCP tool
  // exists for them regardless of any key's permissions.
  // NOTE: collection ops run with overrideAccess:false (enforced under the key's
  // linked user). Global updates, however, bypass Payload access control in the
  // plugin — so globals are exposed READ-ONLY here (find only). Edit globals via
  // the admin panel, which enforces access control properly.
  mcpPlugin({
    collections: {
      folders: { enabled: true },
      pages: { enabled: true },
      posts: { enabled: true },
      products: { enabled: true },
      media: { enabled: true },
      categories: { enabled: true },
      briefs: { enabled: true },
      quizzes: { enabled: true },
      'scent-profiles': { enabled: true },
      documentation: { enabled: true },
      'how-to-guides': { enabled: true },
      redirects: { enabled: true },
      forms: { enabled: true },
      events: { enabled: true },
    },
    globals: {
      header: { enabled: { find: true, update: false } },
      footer: { enabled: { find: true, update: false } },
      'site-theme': { enabled: { find: true, update: false } },
      'studio-info': { enabled: { find: true, update: false } },
    },
    overrideApiKeyCollection: (collection: CollectionConfig): CollectionConfig => ({
      ...collection,
      admin: {
        ...collection.admin,
        description:
          'API keys for the Payload MCP server used by AI coding tools. Unrelated to storefront/customer data.',
      },
    }),
  }),
  sentryPlugin({
    Sentry,
  }),
]
