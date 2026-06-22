import type { RequiredDataFromCollectionSlug } from 'payload'
import {
  createBulletList,
  createHeading,
  createParagraph,
  createRichText,
} from '@/utilities/lexicalHelpers'

type Doc = RequiredDataFromCollectionSlug<'documentation'>

const publishingFirstPost: Doc = {
  title: 'Getting Started: Publishing Your First Post',
  slug: 'getting-started-publishing-first-post',
  order: 1,
  category: 'Publishing Workflow',
  content: createRichText([
    createHeading('Navigate to Posts', 'h2'),
    createParagraph(
      'From the admin sidebar, open Content → Posts. Click the blue "Create Post" button in the top right. You will land on a blank post editor with three tabs: Content, Meta, and SEO.',
    ),
    createHeading('Add Content', 'h2'),
    createParagraph(
      'In the Content tab, fill in the title field at the top — this auto-generates the slug. Upload a hero image using the Hero Image field. Below that, the rich-text editor accepts headings (H2–H4), body paragraphs, blockquotes, images (via the Media Block), and callout banners. Use the toolbar or the "/" slash command to insert blocks.',
    ),
    createHeading('Fill in SEO Fields', 'h2'),
    createParagraph(
      'Switch to the SEO tab. Add an SEO Title (50–60 characters), an SEO Description (150–160 characters), and optionally a separate OG image. These fields control what appears in Google results and social sharing previews.',
    ),
    createHeading('Draft, Preview, and Publish', 'h2'),
    createParagraph(
      'The post starts in Draft status. Click Save Draft to preserve your work. To preview, click the Preview button in the top-right sidebar panel; this opens the live frontend at the post URL. When the content is ready, switch the Status toggle from Draft to Published and click Save.',
    ),
    createHeading('Quick Checklist', 'h2'),
    createBulletList(
      'Title and slug set',
      'Hero image uploaded',
      'Content written (headings, paragraphs, media)',
      'SEO title and description filled',
      'Previewed at least once before publishing',
    ),
  ]) as Doc['content'],
}

const managingEtsySync: Doc = {
  title: 'Managing Products & Etsy Sync',
  slug: 'managing-products-etsy-sync',
  order: 2,
  category: 'Etsy Integration',
  content: createRichText([
    createHeading('How Etsy Sync Works', 'h2'),
    createParagraph(
      'Candera products are sourced from an Etsy shop via the Etsy OAuth2 API. An access token is stored in Admin → Resources → Etsy Tokens. The sync endpoint fetches active listings from Etsy and creates or updates matching documents in the Products collection.',
    ),
    createHeading('Running a Sync', 'h2'),
    createParagraph(
      'Syncs can be triggered by calling the POST /api/etsy/sync endpoint while authenticated as an admin. The endpoint refreshes the access token if necessary, fetches all active listings, and upserts each product document by its etsyListingId. Check the server logs for success or error messages.',
    ),
    createHeading('After Sync: What to Edit', 'h2'),
    createParagraph(
      'The sync sets the product title, price, and Etsy listing ID. Editors should then open each product in Admin → Content → Products to:',
    ),
    createBulletList(
      'Upload or assign a Candera-branded product image',
      'Write a tagline and fill in the scent profile (top/heart/base notes)',
      'Assign the correct Atmosphere (scent-profile relationship)',
      'Set the burn time and vessel code',
      'Change _status from Draft to Published when ready',
    ),
    createHeading('Publishing a Product', 'h2'),
    createParagraph(
      'Products are created as drafts after sync. They will not appear on the storefront until their status is set to Published. To publish, open the product, toggle Status to Published in the sidebar, and save. The storefront revalidates automatically — changes appear within seconds.',
    ),
  ]) as Doc['content'],
}

const runningSeedProcess: Doc = {
  title: 'Running the Seed & Reset Process',
  slug: 'running-the-seed-reset-process',
  order: 3,
  category: 'Seeding & Data',
  content: createRichText([
    createHeading('WARNING: Destructive Operation', 'h2'),
    createParagraph(
      'The seed process deletes ALL existing content in the database (posts, products, pages, media, categories, forms, quizzes, and how-to guides) before inserting fresh demo data. Never run seed on a production database unless you intend to completely reset the site.',
    ),
    createHeading('When to Use Seed', 'h2'),
    createParagraph(
      'Seed is for local development and staging environments where you want a clean, predictable set of demo content. It is also used to reset a staging branch to a known-good state before a client demo.',
    ),
    createHeading('Required Environment Variables', 'h2'),
    createBulletList(
      'SEED_ADMIN_EMAIL — admin account email address',
      'SEED_ADMIN_PASSWORD — admin account password',
      'SEED_ADMIN_NAME — display name for the admin user',
      'SEED_DEMO_AUTHOR_EMAIL — demo author account email',
      'SEED_DEMO_AUTHOR_PASSWORD — demo author password',
      'DATABASE_URI or POSTGRES_URL — Neon Postgres connection string',
    ),
    createHeading('How to Run', 'h2'),
    createParagraph(
      'With the app running, send an authenticated POST request to /api/seed. The endpoint is protected — you must be logged in as an admin, or include a valid CRON_SECRET Bearer token. The seed takes 30–90 seconds depending on image upload speed.',
    ),
    createHeading('After Seeding', 'h2'),
    createParagraph(
      'After seed completes, the admin user specified by SEED_ADMIN_EMAIL will be the only admin account. Log in with those credentials. All how-to guides are created as drafts and must be reviewed and published manually.',
    ),
  ]) as Doc['content'],
}

const usingDraftsAndPreview: Doc = {
  title: 'Using Drafts, Scheduling & Live Preview',
  slug: 'using-drafts-scheduling-live-preview',
  order: 4,
  category: 'CMS Usage',
  content: createRichText([
    createHeading('Draft Mode', 'h2'),
    createParagraph(
      'Every post, product, and how-to guide starts in Draft status. Drafts are invisible on the public frontend — only authenticated admin users can see them via the preview URL. Autosave fires every two seconds while you type, so your work is never lost.',
    ),
    createHeading('Scheduling a Publish Date', 'h2'),
    createParagraph(
      'To schedule a piece of content to go live at a future date and time, set the Published At field in the sidebar to a future timestamp, then save the document. The content will remain in Draft status on the frontend until that date, at which point Payload automatically publishes it.',
    ),
    createHeading('Live Preview', 'h2'),
    createParagraph(
      'Every draft post and how-to guide has a Live Preview button in the admin sidebar. Clicking it opens the public-facing frontend URL for that document in preview mode. Changes you make in the editor are reflected in the preview in real time — no save required. This lets you proof layout and typography before publishing.',
    ),
    createHeading('Publishing', 'h2'),
    createParagraph(
      'When content is ready, locate the Status toggle in the sidebar (it shows "Draft" by default). Switch it to Published and click Save. The Next.js ISR cache for that URL revalidates immediately, and the page goes live within seconds.',
    ),
    createHeading('Reverting to Draft', 'h2'),
    createParagraph(
      'To temporarily hide published content, switch Status back to Draft and save. The page will return a 404 until it is republished. The content and all edit history are preserved in the Versions panel.',
    ),
  ]) as Doc['content'],
}

export const seedAdminDocs = async (payload: import('payload').Payload): Promise<void> => {
  payload.logger.info('— Seeding admin documentation...')

  for (const doc of [
    publishingFirstPost,
    managingEtsySync,
    runningSeedProcess,
    usingDraftsAndPreview,
  ]) {
    await payload.create({
      collection: 'documentation',
      depth: 0,
      context: { disableRevalidate: true },
      data: doc,
    })
  }
}
