import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { payloadLogger } from './logger'

/**
 * Seam decoupling revalidation actions from Next.js caching libraries.
 */
export interface CacheBusterPort {
  revalidatePath(path: string): Promise<void> | void
  revalidateTag(tag: string): Promise<void> | void
}

/**
 * Classifies failures from next/cache calls into the two benign cases we
 * deliberately swallow. Anything unclassified is rethrown by the caller.
 *
 * - 'module-unavailable': next/cache itself can't be imported (test
 *   environments, plain scripts). Requires the error to name next/cache —
 *   a resolution failure elsewhere in the import graph must not be
 *   misclassified as a harmless cache miss.
 * - 'outside-request-context': the API was called outside a Next.js request
 *   (Payload hooks fired from scripts/seeds). Next exposes NO typed error for
 *   this — the invariant message substring is the only available signal, so
 *   it is isolated here where a Next wording change breaks exactly one place.
 */
function classifyNextCacheError(
  err: unknown,
): 'module-unavailable' | 'outside-request-context' | 'unknown' {
  if (!(err instanceof Error)) return 'unknown'
  const code = (err as Error & { code?: string }).code
  const isResolutionError =
    code === 'ERR_MODULE_NOT_FOUND' ||
    code === 'MODULE_NOT_FOUND' ||
    err.message.includes('Cannot find module') ||
    err.message.includes('Could not resolve')
  if (isResolutionError && err.message.includes('next/cache')) return 'module-unavailable'
  if (err.message.includes('static generation store missing')) return 'outside-request-context'
  return 'unknown'
}

/**
 * Production adapter wrapping Next.js native Cache APIs.
 */
export class NextCacheBusterAdapter implements CacheBusterPort {
  private async invalidate(action: () => Promise<void>, label: string): Promise<void> {
    try {
      await action()
    } catch (err) {
      switch (classifyNextCacheError(err)) {
        case 'outside-request-context':
          // Expected when Payload hooks run outside a Next.js request (scripts, seeds).
          return
        case 'module-unavailable':
          payloadLogger.warn(`Skipping ${label} — next/cache not available in this environment`)
          return
        default:
          // Contain rather than rethrow: callers fire-and-forget these
          // invalidations (e.g. `void nextCacheBuster.revalidateTag(...)` in
          // revalidateForm), where a rethrow becomes an unhandled rejection.
          // A failed cache invalidation must never take down a save.
          payloadLogger.error(err, `Failed ${label}`)
          return
      }
    }
  }

  async revalidatePath(path: string): Promise<void> {
    await this.invalidate(async () => {
      const { revalidatePath } = await import('next/cache')
      revalidatePath(path)
    }, `revalidatePath(${path})`)
  }

  async revalidateTag(tag: string): Promise<void> {
    await this.invalidate(async () => {
      const { revalidateTag } = await import('next/cache')
      revalidateTag(tag, 'max')
    }, `revalidateTag(${tag})`)
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
  private rules: RevalidationRule<unknown>[] = []
  private cacheBuster: CacheBusterPort

  constructor(cacheBuster: CacheBusterPort) {
    this.cacheBuster = cacheBuster
  }

  registerRule<TDoc = unknown>(rule: RevalidationRule<TDoc>): void {
    this.rules.push(rule as RevalidationRule<unknown>)
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
export function createSlugRevalidationRule<
  TDoc extends { slug?: string | null; _status?: string },
>(options: {
  name: string
  collections: string[]
  formatPaths: (slug: string, doc: TDoc) => string[]
  groupTag?: string
}): RevalidationRule<TDoc> {
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
      const wasPublished = prevDoc ? !prevDoc._status || prevDoc._status === 'published' : false

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
  createSlugRevalidationRule<{ slug?: string | null; _status?: string }>({
    name: 'pages-revalidation',
    collections: ['pages'],
    groupTag: 'pages-sitemap',
    formatPaths: (slug) => [slug === 'home' ? '/' : `/${slug}`],
  }),
)

// 2. Posts Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<{ slug?: string | null; _status?: string }>({
    name: 'posts-revalidation',
    collections: ['posts'],
    groupTag: 'posts-sitemap',
    formatPaths: (slug) => [`/posts/${slug}`],
  }),
)

// 3. Products Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<{ slug?: string | null; _status?: string }>({
    name: 'products-revalidation',
    collections: ['products'],
    groupTag: 'products-sitemap',
    formatPaths: (slug) => [`/products/${slug}`, '/'],
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

// 5. How-To Guides Rule
globalRevalidator.registerRule(
  createSlugRevalidationRule<{ slug?: string | null; _status?: string }>({
    name: 'how-tos-revalidation',
    collections: ['how-to-guides'],
    groupTag: 'how-tos-sitemap',
    formatPaths: (slug) => [`/how-to/${slug}`, '/how-to'],
  }),
)

export const howToGuidesRevalidateHooks = createCollectionHooks('how-to-guides')
