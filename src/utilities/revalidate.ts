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

// -------------------------------------------------------------
// DEFAULT PRODUCTION INSTANCE & STANDARD RULES
// -------------------------------------------------------------

export const nextCacheBuster = new NextCacheBusterAdapter()
export const globalRevalidator = new FlexibleRevalidator(nextCacheBuster)

// 1. Pages Revalidation Rule
globalRevalidator.registerRule<any>({
  name: 'pages-revalidation',
  collections: ['pages'],
  condition: (ctx) => !ctx.req.context.disableRevalidate,
  resolve: (ctx) => {
    const paths: string[] = []
    const tags = ['pages-sitemap']

    if (ctx.operation === 'change') {
      if (ctx.doc._status === 'published') {
        paths.push(ctx.doc.slug === 'home' ? '/' : `/${ctx.doc.slug}`)
      }
      if (ctx.previousDoc?._status === 'published' && ctx.doc._status !== 'published') {
        paths.push(ctx.previousDoc.slug === 'home' ? '/' : `/${ctx.previousDoc.slug}`)
      }
    } else if (ctx.operation === 'delete') {
      paths.push(ctx.doc?.slug === 'home' ? '/' : `/${ctx.doc?.slug}`)
    }

    return { paths, tags }
  },
})

// 2. Posts Revalidation Rule
globalRevalidator.registerRule<any>({
  name: 'posts-revalidation',
  collections: ['posts'],
  condition: (ctx) => !ctx.req.context.disableRevalidate,
  resolve: (ctx) => {
    const paths: string[] = []
    const tags = ['posts-sitemap']

    if (ctx.operation === 'change') {
      if (ctx.doc._status === 'published') {
        paths.push(`/posts/${ctx.doc.slug}`)
      }
      if (ctx.previousDoc?._status === 'published' && ctx.doc._status !== 'published') {
        paths.push(`/posts/${ctx.previousDoc.slug}`)
      }
    } else if (ctx.operation === 'delete') {
      paths.push(`/posts/${ctx.doc?.slug}`)
    }

    return { paths, tags }
  },
})

// 3. Products Revalidation Rule
globalRevalidator.registerRule<any>({
  name: 'products-revalidation',
  collections: ['products'],
  resolve: (ctx) => {
    const paths: string[] = ['/products']
    const tags = ['products-sitemap']

    const slug = ctx.doc?.slug
    if (slug) paths.push(`/products/${slug}`)
    if (ctx.previousDoc?.slug && ctx.previousDoc.slug !== slug) {
      paths.push(`/products/${ctx.previousDoc.slug}`)
    }

    return { paths, tags }
  },
})

// 4. Posts list + paginated pages Revalidation Rule (supplement to per-post rule above)
globalRevalidator.registerRule<any>({
  name: 'posts-list-revalidation',
  collections: ['posts'],
  condition: (ctx) => !ctx.req.context.disableRevalidate,
  resolve: () => ({
    paths: ['/posts'],
    tags: ['posts-sitemap'],
  }),
})

// 5. Redirects Revalidation Rule
globalRevalidator.registerRule<any>({
  name: 'redirects-revalidation',
  collections: ['redirects'],
  resolve: () => ({
    paths: [],
    tags: ['redirects'],
  }),
})

// Helper factory to create standard change/delete hooks for Payload config
export function createCollectionHooks(collection: string, revalidator: FlexibleRevalidator = globalRevalidator) {
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
export const redirectRevalidateHooks = createCollectionHooks('redirects')
export const productRevalidateHooks = createCollectionHooks('products')
