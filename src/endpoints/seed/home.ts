import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { buildHomePage } from './home-layout'

type HomeArgs = {
  heroImage: Media
  scentQuizFormId?: string | number
  scentQuizId?: string | number
}

// Seeded homepage — content/structure lives in ./home-layout (single source of truth).
export const home = ({
  heroImage,
  scentQuizFormId,
  scentQuizId,
}: HomeArgs): RequiredDataFromCollectionSlug<'pages'> =>
  buildHomePage({ heroImageId: heroImage.id, scentQuizFormId, scentQuizId })
