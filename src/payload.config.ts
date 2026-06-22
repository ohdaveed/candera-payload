import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

import { payloadLogger } from './utilities/logger'

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is not set. Set this environment variable before starting.')
}
payloadLogger.success('PAYLOAD_SECRET is successfully loaded.')
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Briefs } from './collections/Briefs'
import { Folders } from './collections/Folders'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteTheme } from './SiteTheme/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { createHomeEndpoint } from './endpoints/createHome'
import { EtsyTokens } from './collections/EtsyTokens'
import { etsyEndpoints } from './endpoints/etsy'

import { Quizzes } from './collections/Quizzes'
import { ScentProfiles } from './collections/ScentProfiles'
import { Documentation } from './collections/Documentation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const databaseAdapter = vercelPostgresAdapter({
  pool: { connectionString: databaseConnectionString },
  push: false,
})
const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const hasValidBlobToken = blobToken?.startsWith('vercel_blob_rw_') === true

if (process.env.VERCEL_ENV === 'production' && !hasValidBlobToken) {
  throw new Error('BLOB_READ_WRITE_TOKEN must be set to a valid Vercel Blob token in production.')
}

const corsOrigins: string[] = [
  getServerSideURL(),
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter((origin): origin is string => Boolean(origin))

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: 'Candera Candles',
      icons: [
        {
          url: '/favicon.ico',
        },
      ],
    },
    components: {
      graphics: {
        Logo: {
          path: '@/components/Logo/Logo',
          exportName: 'Logo',
        },
        Icon: {
          path: '@/components/Logo/Logo',
          exportName: 'LogoIcon',
        },
      },
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: databaseAdapter,
  collections: [
    Folders,
    Pages,
    Posts,
    Products,
    Media,
    Categories,
    Users,
    EtsyTokens,
    Briefs,
    Quizzes,
    ScentProfiles,
    Documentation,
  ],
  cors: corsOrigins,
  plugins: [
    ...plugins,
    ...(hasValidBlobToken
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: blobToken as string,
            // Re-seeding re-uploads the same filenames; the blob store rejects duplicates otherwise
            addRandomSuffix: true,
          }),
        ]
      : []),
  ],
  globals: [Header, Footer, SiteTheme],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'info@canderacandles.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Candera',
    transportOptions: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : {
          jsonTransport: true, // Use a non-network transport if no SMTP_HOST is provided
        },
  }),
  endpoints: [createHomeEndpoint, ...etsyEndpoints],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
