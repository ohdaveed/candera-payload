import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vite-plus/test'
import { seedOwnerDocs, OWNER_DOCS } from '@/endpoints/seed/owner-docs'

let payload: Payload

const EXPECTED_SLUGS = [
  'welcome-to-candera',
  'drafts-and-publishing',
  'managing-pages',
  'managing-products',
  'writing-posts',
  'managing-media',
  'navigation-and-footer',
  'brand-look-settings',
  'managing-scent-quiz',
  'etsy-integration',
  'using-demo-content',
  'developer-reset-demo-data',
]

describe('seedOwnerDocs', () => {
  beforeAll(async () => {
    // This suite runs DESTRUCTIVE replace semantics on the documentation
    // collection. Refuse to run against anything but a local test database so a
    // misconfigured run can never clobber real (e.g. Neon) documentation.
    const conn =
      process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
    if (!/@(localhost|127\.0\.0\.1)[:/]/.test(conn)) {
      throw new Error(
        'ownerDocs.int.spec.ts is destructive; refusing to run against a non-local database. ' +
          'Point DATABASE_URI/POSTGRES_URL at a local test DB ' +
          '(e.g. postgresql://postgres@localhost:54320/candera_test).',
      )
    }
    payload = await getPayload({ config: await config })
    // Seed once up front so every test is order-independent (subsets can run
    // in isolation without depending on a prior test having seeded).
    await seedOwnerDocs(payload)
  })

  it('exports 12 entries with valid categories and non-empty Lexical content', () => {
    expect(OWNER_DOCS).toHaveLength(12)
    const validCategories = [
      'CMS Usage',
      'Seeding & Data',
      'Etsy Integration',
      'Publishing Workflow',
      'Design & Theming',
    ]
    for (const doc of OWNER_DOCS) {
      expect(validCategories).toContain(doc.category)
      expect(
        (doc.content as { root: { children: unknown[] } }).root.children.length,
      ).toBeGreaterThan(0)
    }
  })

  it('replaces the documentation collection with exactly the canonical set', async () => {
    await seedOwnerDocs(payload)
    const after = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
    expect(after.totalDocs).toBe(12)
    expect(after.docs.map((d) => d.slug).sort()).toEqual([...EXPECTED_SLUGS].sort())
  })

  it('is idempotent and restores edited entries on re-run', async () => {
    const target = await payload.find({
      collection: 'documentation',
      where: { slug: { equals: 'welcome-to-candera' } },
      limit: 1,
    })
    await payload.update({
      collection: 'documentation',
      id: target.docs[0].id,
      data: { title: 'TAMPERED' },
    })
    await seedOwnerDocs(payload)
    const after = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
    expect(after.totalDocs).toBe(12)
    const restored = after.docs.find((d) => d.slug === 'welcome-to-candera')
    expect(restored?.title).toBe('Welcome to Your Dashboard')
  })

  it('hides only the developer entry from the dashboard query', async () => {
    const ownerFacing = await payload.find({
      collection: 'documentation',
      where: { category: { not_equals: 'Seeding & Data' } },
      limit: 12,
      sort: 'order',
      depth: 0,
    })
    expect(ownerFacing.totalDocs).toBe(11)
    expect(ownerFacing.docs.some((d) => d.slug === 'developer-reset-demo-data')).toBe(false)
  })
})
