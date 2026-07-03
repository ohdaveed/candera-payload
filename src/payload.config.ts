import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { shouldUseVercelPostgresAdapter } from './utilities/databaseAdapter'
import { validateBootConfig } from './utilities/bootValidation'
import { resolveDatabaseConnectionString, isValidVercelBlobToken } from './utilities/resolveEnvValue'

// Run boot-time verification of configuration and environment variables
validateBootConfig()

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
import { StudioInfo } from './StudioInfo/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { EtsyTokens } from './collections/EtsyTokens'
import { etsyEndpoints } from './endpoints/etsy'

import { Quizzes } from './collections/Quizzes'
import { ScentProfiles } from './collections/ScentProfiles'
import { Documentation } from './collections/Documentation'
import { HowToGuides } from './collections/HowToGuides'
import { BRAND } from './constants/brand'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseConnectionString = resolveDatabaseConnectionString() || ''
// The Vercel adapter speaks Neon's serverless protocol and only works against a
// Neon-hosted database. Production uses Neon (a `*.neon.tech` host) and keeps the
// Vercel adapter; plain Postgres (local dev / CI service container) falls back to
// the standard adapter so the same config runs everywhere.
const databaseAdapter = shouldUseVercelPostgresAdapter(databaseConnectionString)
  ? vercelPostgresAdapter({
      push: false,
      pool: { connectionString: databaseConnectionString },
    })
  : postgresAdapter({
      push: false,
      pool: { connectionString: databaseConnectionString },
    })
const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const hasValidBlobToken = isValidVercelBlobToken(blobToken)

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
    HowToGuides,
  ],
  cors: corsOrigins,
  plugins: [
    ...plugins,
    ...(hasValidBlobToken
      ? [
          vercelBlobStorage({
            collections: {
              media: {
                // Prevent Payload from writing to local disk when Blob is active
                disableLocalStorage: true,
              },
            },
            token: blobToken as string,
            // Re-seeding re-uploads the same filenames; the blob store rejects duplicates otherwise
            addRandomSuffix: true,
            // Ensure Blob-specific schema fields (e.g. prefix) are always present,
            // keeping the DB schema consistent across local and production environments.
            alwaysInsertFields: true,
          }),
        ]
      : []),
  ],
  globals: [Header, Footer, SiteTheme, StudioInfo],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  // Prefer Resend when a key is present; otherwise fall back to nodemailer (SMTP if
  // configured, else a non-network jsonTransport) so email paths like password reset
  // are harmless no-ops in local/preview rather than failing against an empty key.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || BRAND.email,
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Candera',
        apiKey: process.env.RESEND_API_KEY,
      })
    : nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || BRAND.email,
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
              jsonTransport: true,
            },
      }),
  endpoints: [...etsyEndpoints],
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
