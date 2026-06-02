import { describe, it, expect, vi } from 'vitest'
import { FlexibleRevalidator, CacheBusterPort, RevalidationRule } from '@/utilities/revalidate'
import type { PayloadRequest } from 'payload'

class InMemoryCacheBusterAdapter implements CacheBusterPort {
  public invalidatedPaths: string[] = []
  public invalidatedTags: string[] = []

  revalidatePath(path: string): void {
    this.invalidatedPaths.push(path)
  }

  revalidateTag(tag: string): void {
    this.invalidatedTags.push(tag)
  }

  clear() {
    this.invalidatedPaths = []
    this.invalidatedTags = []
  }
}

function createMockRequest(disableRevalidate = false): PayloadRequest {
  return {
    payload: {
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    },
    context: {
      disableRevalidate,
    },
  } as unknown as PayloadRequest
}

describe('FlexibleRevalidator Engine', () => {
  it('aggregates and triggers path and tag invalidations based on registered rules', async () => {
    const cacheBuster = new InMemoryCacheBusterAdapter()
    const revalidator = new FlexibleRevalidator(cacheBuster)

    const rule1: RevalidationRule = {
      name: 'rule-1',
      collections: ['pages'],
      resolve: () => ({
        paths: ['/home', 'test-path'],
        tags: ['tag-1'],
      }),
    }

    const rule2: RevalidationRule = {
      name: 'rule-2',
      collections: ['pages'],
      resolve: () => ({
        paths: ['/another'],
        tags: ['tag-2', 'tag-1'], // Duplicate tag to check deduplication
      }),
    }

    revalidator.registerRule(rule1)
    revalidator.registerRule(rule2)

    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: {},
      req: createMockRequest(),
    })

    expect(cacheBuster.invalidatedPaths).toContain('/home')
    expect(cacheBuster.invalidatedPaths).toContain('/test-path') // Normalization check
    expect(cacheBuster.invalidatedPaths).toContain('/another')
    expect(cacheBuster.invalidatedPaths.length).toBe(3)

    expect(cacheBuster.invalidatedTags).toContain('tag-1')
    expect(cacheBuster.invalidatedTags).toContain('tag-2')
    expect(cacheBuster.invalidatedTags.length).toBe(2)
  })

  it('respects condition guard clauses before executing rules', async () => {
    const cacheBuster = new InMemoryCacheBusterAdapter()
    const revalidator = new FlexibleRevalidator(cacheBuster)

    const conditionSpy = vi.fn().mockReturnValue(false)

    revalidator.registerRule({
      name: 'conditional-rule',
      collections: ['posts'],
      condition: conditionSpy,
      resolve: () => ({
        paths: ['/should-not-fire'],
        tags: [],
      }),
    })

    await revalidator.revalidate({
      collection: 'posts',
      operation: 'change',
      doc: {},
      req: createMockRequest(),
    })

    expect(conditionSpy).toHaveBeenCalled()
    expect(cacheBuster.invalidatedPaths.length).toBe(0)
  })
})

describe('Standard Revalidation Rules', () => {
  it('correctly maps pages revalidation transitions', async () => {
    const cacheBuster = new InMemoryCacheBusterAdapter()
    const revalidator = new FlexibleRevalidator(cacheBuster)

    // Re-import rules or redefine them locally for isolated testing
    const pagesRule: RevalidationRule = {
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
        }
        return { paths, tags }
      },
    }

    revalidator.registerRule(pagesRule)

    // Case 1: Created page as draft -> no paths should be revalidated
    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: { slug: 'about', _status: 'draft' },
      req: createMockRequest(),
    })
    expect(cacheBuster.invalidatedPaths.length).toBe(0)
    expect(cacheBuster.invalidatedTags.length).toBe(1)
    expect(cacheBuster.invalidatedTags).toContain('pages-sitemap')
    cacheBuster.clear()

    // Case 2: Created page as published -> revalidates path
    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: { slug: 'about', _status: 'published' },
      req: createMockRequest(),
    })
    expect(cacheBuster.invalidatedPaths).toContain('/about')
    cacheBuster.clear()

    // Case 3: Home page publish -> normalizes to /
    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: { slug: 'home', _status: 'published' },
      req: createMockRequest(),
    })
    expect(cacheBuster.invalidatedPaths).toContain('/')
    cacheBuster.clear()

    // Case 4: Unpublishing previously published page -> revalidates old path
    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: { slug: 'about', _status: 'draft' },
      previousDoc: { slug: 'about', _status: 'published' },
      req: createMockRequest(),
    })
    expect(cacheBuster.invalidatedPaths).toContain('/about')
    cacheBuster.clear()

    // Case 5: disableRevalidate context guard -> skips rules
    await revalidator.revalidate({
      collection: 'pages',
      operation: 'change',
      doc: { slug: 'about', _status: 'published' },
      req: createMockRequest(true), // disableRevalidate = true
    })
    expect(cacheBuster.invalidatedPaths.length).toBe(0)
  })
})
