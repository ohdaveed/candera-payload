import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Seam decoupling revalidation actions from Next.js caching libraries.
 */
export interface CacheBusterPort {
  revalidatePath(path: string): Promise<void> | void
  revalidateTag(tag: string): Promise<void> | void
}

/**
 * Production adapter wrapping Next.js native Cache APIs.
 */
export class NextCacheBusterAdapter implements CacheBusterPort {
  revalidatePath(path: string): void {
    revalidatePath(path)
  }
  revalidateTag(tag: string): void {
    revalidateTag(tag, 'max')
  }
}

export interface RevalidationContext<TDoc = unknown> {
  collection: string
  operation: 'change' | 'delete'
  doc: TDoc
  previousDoc?: TDoc
  req: PayloadRequest
}

export interface RevalidationResult {
  paths: string[]
  tags: string[]
}

export interface RevalidationRule<TDoc = unknown> {
  name: string
  collections: string[]
  condition?: (ctx: RevalidationContext<TDoc>) => boolean | Promise<boolean>
  resolve: (ctx: RevalidationContext<TDoc>) => RevalidationResult | Promise<RevalidationResult>
}

export class FlexibleRevalidator {
  private rules: RevalidationRule<any>[] = []
  private cacheBuster: CacheBusterPort

  constructor(cacheBuster: CacheBusterPort) {
    this.cacheBuster = cacheBuster
  }

  registerRule<TDoc = unknown>(rule: RevalidationRule<TDoc>): void {
    this.rules.push(rule)
  }

  async revalidate(ctx: RevalidationContext): Promise<void> {
    const matchedRules = this.rules.filter((rule) => rule.collections.includes(ctx.collection))

    const pathsToRevalidate = new Set<string>()
    const tagsToRevalidate = new Set<string>()

    for (const rule of matchedRules) {
      try {
        if (rule.condition && !(await rule.condition(ctx))) {
          continue
        }

        const { paths, tags } = await rule.resolve(ctx)

        paths.forEach((p) => {
          // Normalize paths to ensure leading slash
          const normalized = p.startsWith('/') ? p : `/${p}`
          pathsToRevalidate.add(normalized)
        })

        tags.forEach((t) => tagsToRevalidate.add(t))
      } catch (err) {
        ctx.req.payload.logger.error({ err, msg: `Revalidation rule "${rule.name}" failed` })
      }
    }

    // Fire invalidations concurrently
    await Promise.all([
      ...Array.from(pathsToRevalidate).map(async (path) => {
        ctx.req.payload.logger.info(`Revalidating path: ${path}`)
        try {
          await this.cacheBuster.revalidatePath(path)
        } catch (err) {
          ctx.req.payload.logger.error({ err, msg: `Failed to revalidate path: ${path}` })
        }
      }),
      ...Array.from(tagsToRevalidate).map(async (tag) => {
        ctx.req.payload.logger.info(`Revalidating sitemap / cache tag: ${tag}`)
        try {
          await this.cacheBuster.revalidateTag(tag)
        } catch (err) {
          ctx.req.payload.logger.error({ err, msg: `Failed to revalidate tag: ${tag}` })
        }
      }),
    ])
  }
}

/**
 * High-leverage factory for slug-based revalidation rules.
 * Automatically handles published status checks, slug transitions, and group tags.
 */
export function createSlugRevalidationRule<TDoc extends { slug?: string | null; _status?: string }>(
  options: {
    name: string
    collections: string[]
    formatPaths: (slug: string, doc: TDoc) => string[]
    groupTag?: string
  },
): RevalidationRule<TDoc> {
  return {
    name: options.name,
    collections: options.collections,
    condition: (ctx) => !ctx.req.context.disableRevalidate,
    resolve: (ctx) => {
      const doc = ctx.doc as TDoc
      const prevDoc = ctx.previousDoc as TDoc
      const paths = new Set<string>()
      const tags = new Set<string>()

      if (options.groupTag) {
        tags.add(options.groupTag)
      }

      const isPublished = !doc._status || doc._status === 'published'
      const wasPublished = prevDoc ? (!prevDoc._status || prevDoc._status === 'published') : false

      if (ctx.operation === 'change') {
        if (isPublished && doc.slug) {
          options.formatPaths(doc.slug, doc).forEach((p) => paths.add(p))
        }
        // Handle transitions: unpublishing or slug changes
        if (wasPublished && prevDoc?.slug) {
          if (!isPublished || doc.slug !== prevDoc.slug) {
            options.formatPaths(prevDoc.slug, prevDoc).forEach((p) => paths.add(p))
          }
        }
      } else if (ctx.operation === 'delete') {
        if (isPublished && doc.slug) {
          options.formatPaths(doc.slug, doc).forEach((p) => paths.add(p))
        }
      }

      return {
        paths: Array.from(paths),
        tags: Array.from(tags),
      }
    },
  }
}

// -------------------------------------------------------------
// DEFAULT PRODUCTION INSTANCE & STANDARD RULES
// -------------------------------------------------------------

export const nextCacheBuster = new NextCacheBusterAdapter()
export const globalRevalidator = new FlexibleRevalidator(nextCacheBuster)

// 1. Pages Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<any>({
    name: 'pages-revalidation',
    collections: ['pages'],
    groupTag: 'pages-sitemap',
    formatPaths: (slug) => [slug === 'home' ? '/' : `/${slug}`],
  }),
)

// 2. Posts Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<any>({
    name: 'posts-revalidation',
    collections: ['posts'],
    groupTag: 'posts-sitemap',
    formatPaths: (slug) => [`/posts/${slug}`],
  }),
)

// 3. Products Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<any>({
    name: 'products-revalidation',
    collections: ['products'],
    groupTag: 'products-sitemap',
    formatPaths: (slug) => [`/products/${slug}`],
  }),
)

// 4. Redirects Revalidation Rule (Manual)
globalRevalidator.registerRule({
  name: 'redirects-revalidation',
  collections: ['redirects'],
  resolve: () => ({
    paths: [],
    tags: ['redirects'],
  }),
})

// Helper factory to create standard change/delete hooks for Payload config
export function createCollectionHooks(
  collection: string,
  revalidator: FlexibleRevalidator = globalRevalidator,
) {
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
    await revalidator.revalidate({
      collection,
      operation: 'change',
      doc,
      previousDoc,
      req,
    })
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await revalidator.revalidate({
      collection,
      operation: 'delete',
      doc,
      req,
    })
    return doc
  }

  return { afterChange, afterDelete }
}

export const pageRevalidateHooks = createCollectionHooks('pages')
export const postRevalidateHooks = createCollectionHooks('posts')
export const productRevalidateHooks = createCollectionHooks('products')
export const redirectRevalidateHooks = createCollectionHooks('redirects')

