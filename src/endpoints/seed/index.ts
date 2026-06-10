import type {
  CollectionSlug,
  GlobalSlug,
  Payload,
  PayloadRequest,
  File,
  RequiredDataFromCollectionSlug,
} from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { innerCircleForm as innerCircleFormData } from './inner-circle-form'
import { scentQuizForm as scentQuizFormData } from './scent-quiz-form'
import { seedScentQuiz } from './scent-quiz'
import { contact as contactPageData } from './contact-page'
import { about as aboutPageData } from './about-page'
import { home } from './home'
import { legalPage } from './legal-pages'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { post4 } from './post-4'
import { post5 } from './post-5'
import type { Media } from '@/payload-types'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'forms',
  'form-submissions',
  'search',
  'scent-profiles',
  'quizzes',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and admin user...`)

  await Promise.all([
    payload.delete({
      collection: 'users',
      depth: 0,
      where: { email: { equals: 'demo-author@example.com' } },
    }),
    payload.delete({
      collection: 'users',
      depth: 0,
      where: { email: { equals: process.env.SEED_ADMIN_EMAIL || 'admin@canderacandles.com' } },
    }),
  ])

  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword)
    throw new Error('SEED_ADMIN_PASSWORD env var is required to seed the database')

  await payload.create({
    collection: 'users',
    data: {
      name: process.env.SEED_ADMIN_NAME || 'Candera Admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@canderacandles.com',
      password: adminPassword,
      roles: ['admin'],
    } as never,
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  const candleraImages = await loadCandleraImages()

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
    Promise.all(
      categories.map((category) =>
        payload.create({
          collection: 'categories',
          data: {
            title: category,
            slug: category,
          },
        }),
      ),
    ),
  ])

  // Upload Candera product images
  const candleraMediaDocs: Record<string, { id: string | number }> = {}
  for (const [key, file] of Object.entries(candleraImages)) {
    if (file) {
      try {
        candleraMediaDocs[key] = await payload.create({
          collection: 'media',
          data: { alt: key.replace(/-/g, ' ') },
          file,
        })
      } catch (error) {
        payload.logger.warn(
          `— Skipping image '${key}': upload failed (${error instanceof Error ? error.message : String(error)})`,
        )
      }
    }
  }

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  const post4Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post4({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post5Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post5({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    context: {
      disableRevalidate: true,
    },
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    context: {
      disableRevalidate: true,
    },
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    context: {
      disableRevalidate: true,
    },
    data: {
      relatedPosts: [post4Doc.id, post5Doc.id],
    },
  })
  await payload.update({
    id: post4Doc.id,
    collection: 'posts',
    context: {
      disableRevalidate: true,
    },
    data: {
      relatedPosts: [post3Doc.id, post5Doc.id],
    },
  })
  await payload.update({
    id: post5Doc.id,
    collection: 'posts',
    context: {
      disableRevalidate: true,
    },
    data: {
      relatedPosts: [post3Doc.id, post4Doc.id],
    },
  })

  payload.logger.info(`— Seeding products...`)

  // atmosphere is a relationship to scent-profiles seeded later; linked in a second pass below
  const productSeedData = [
    {
      title: 'Seashell Garden Glow',
      slug: 'seashell-garden-glow',
      etsyListingId: 1001,
      vessel: '001',
      price: 38,
      productTag: 'Bestseller',
      atmosphereSlug: 'coastal',
      burnTime: '60 Hours',
      tagline: 'Gathered from the tide. A practice in coastal stillness.',
      scentProfile: { top: 'Sea Breeze', heart: 'Driftwood', base: 'Salt Air' },
      imageKey: 'seashell-garden',
    },
    {
      title: 'Meadowlight Botanical',
      slug: 'meadowlight-botanical',
      etsyListingId: 1002,
      vessel: '002',
      price: 38,
      productTag: 'New Release',
      atmosphereSlug: 'fresh',
      burnTime: '60 Hours',
      tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
      scentProfile: { top: 'Fresh Green', heart: 'Lily of the Valley', base: 'Morning Dew' },
      imageKey: 'meadowlight-botanical',
    },
    {
      title: 'Crimson Noir',
      slug: 'crimson-noir',
      etsyListingId: 1003,
      vessel: '003',
      price: 38,
      productTag: 'Limited Batch',
      atmosphereSlug: 'moody',
      burnTime: '60 Hours',
      tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
      scentProfile: { top: 'Dark Berry', heart: 'Merlot', base: 'Vetiver' },
      imageKey: 'crimson-noir',
    },
    {
      title: 'Ever After Glow',
      slug: 'ever-after-glow',
      etsyListingId: 1004,
      vessel: '004',
      price: 38,
      productTag: 'Bestseller',
      atmosphereSlug: 'romantic',
      burnTime: '60 Hours',
      tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
      scentProfile: { top: 'White Lilac', heart: 'Blue Hydrangea', base: 'Soft Musk' },
      imageKey: 'ever-after-glow',
    },
    {
      title: "Anya's Eyes",
      slug: 'anyas-eyes',
      etsyListingId: 1005,
      vessel: '005',
      price: 38,
      productTag: 'Limited Batch',
      atmosphereSlug: 'contemplative',
      burnTime: '60 Hours',
      tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
      scentProfile: { top: 'Lilac', heart: 'Pressed Pansy', base: 'Soft Powder' },
      imageKey: 'anyas-eyes',
    },
    {
      title: 'Scarlet Bloom',
      slug: 'scarlet-bloom',
      etsyListingId: 1006,
      vessel: '006',
      price: 38,
      productTag: 'New Release',
      atmosphereSlug: 'bold',
      burnTime: '60 Hours',
      tagline: 'Botanical architecture. Bold florals grounded in ritual.',
      scentProfile: { top: 'Fresh Florals', heart: 'Botanical Rose', base: 'Green Stem' },
      imageKey: 'scarlet-bloom',
    },
  ]

  const productDocs = await Promise.all(
    productSeedData.map(({ imageKey, atmosphereSlug: _atm, ...product }) => {
      const mediaDoc = candleraMediaDocs[imageKey]
      return payload.create({
        collection: 'products',
        data: {
          ...product,
          _status: 'published',
          ...(mediaDoc ? { extraPhotos: [mediaDoc.id] } : {}),
        } as unknown as RequiredDataFromCollectionSlug<'products'>,
      })
    }),
  )

  payload.logger.info(`— Seeding forms...`)

  const [contactForm, , scentQuizFormDoc] = await Promise.all([
    payload.create({ collection: 'forms', depth: 0, data: contactFormData }),
    payload.create({ collection: 'forms', depth: 0, data: innerCircleFormData }),
    payload.create({ collection: 'forms', depth: 0, data: scentQuizFormData }),
  ])

  const { profileDocs, quizId } = await seedScentQuiz(payload)

  // Second pass: link each product to its atmosphere (scent-profile)
  payload.logger.info(`— Linking product atmospheres...`)
  await Promise.all(
    productDocs.map((doc, i) => {
      const { atmosphereSlug } = productSeedData[i]
      const atmosphereId = profileDocs[atmosphereSlug]
      if (!atmosphereId) return Promise.resolve()
      return payload.update({
        collection: 'products',
        id: doc.id,
        data: { atmosphere: atmosphereId } as unknown as RequiredDataFromCollectionSlug<'products'>,
      })
    }),
  )

  payload.logger.info(`— Seeding pages...`)

  const [_, contactPage, aboutPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: home({
        heroImage: (candleraMediaDocs['seashell-garden'] as unknown as Media) || imageHomeDoc,
        scentQuizFormId: scentQuizFormDoc.id,
        scentQuizId: quizId,
      }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: contactPageData({ contactForm: contactForm }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: aboutPageData({
        aboutImage:
          (candleraMediaDocs['minimalist-airy-about'] as unknown as Media) || imageHomeDoc,
      }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: legalPage('Shipping & Returns') as RequiredDataFromCollectionSlug<'pages'>,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: legalPage('Wholesale') as RequiredDataFromCollectionSlug<'pages'>,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: legalPage('Privacy Policy') as RequiredDataFromCollectionSlug<'pages'>,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: legalPage('Terms of Service') as RequiredDataFromCollectionSlug<'pages'>,
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      context: {
        disableRevalidate: true,
      },
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Collection',
              url: '/products',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: {
                relationTo: 'pages',
                value: aboutPage.id,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Journal',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      context: {
        disableRevalidate: true,
      },
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: {
                relationTo: 'pages',
                value: aboutPage.id,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
        assistanceItems: [
          {
            link: {
              type: 'custom',
              label: 'Shipping & Returns',
              url: '/shipping-and-returns',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Wholesale',
              url: '/wholesale',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
        footerLinks: [
          {
            link: {
              type: 'custom',
              label: 'Privacy Policy',
              url: '/privacy-policy',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Terms of Service',
              url: '/terms-of-service',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function loadCandleraImages(): Promise<Record<string, File | null>> {
  const fs = await import('fs')
  const path = await import('path')

  const images = [
    'seashell-garden',
    'meadowlight-botanical',
    'crimson-noir',
    'ever-after-glow',
    'anyas-eyes',
    'scarlet-bloom',
    'minimalist-airy-about',
    'minimalist-airy-home',
  ]

  const result: Record<string, File | null> = {}

  for (const name of images) {
    const isPng = name.includes('minimalist')
    const ext = isPng ? 'png' : 'jpg'
    const filePath = path.join(process.cwd(), 'public', 'candera', `${name}.${ext}`)
    try {
      const data = fs.readFileSync(filePath)
      result[name] = {
        name: `${name}.${ext}`,
        data,
        mimetype: isPng ? 'image/png' : 'image/jpeg',
        size: data.byteLength,
      }
    } catch {
      result[name] = null
    }
  }

  return result
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
