import type { RequiredDataFromCollectionSlug } from 'payload'
import { buildHomePage } from './home-layout'

// Pre-seeded fallback so the homepage isn't empty before the DB is seeded.
// Content/structure lives in ./home-layout (single source of truth).
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = buildHomePage()
