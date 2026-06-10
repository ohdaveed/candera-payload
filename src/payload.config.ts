import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

import { payloadLogger } from './utilities/logger'

if (!process.env.PAYLOAD_SECRET) {
  payloadLogger.warn('PAYLOAD_SECRET is not set! Authentication will fail.')
} else {
  payloadLogger.success('PAYLOAD_SECRET is successfully loaded.')
}
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
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { syncEtsyListings } from './utilities/syncEtsy'
import { createHomeEndpoint } from './endpoints/createHome'
import { EtsyTokens } from './collections/EtsyTokens'
import { EtsyClient, DefaultPayloadTokenRepository } from './utilities/etsyClient'

import { Quizzes } from './collections/Quizzes'
import { ScentProfiles } from './collections/ScentProfiles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
    },
    push: false,
  }),
  collections: [
    {
      slug: 'folders',
      folders: true,
      admin: {
        useAsTitle: 'name',
        group: 'System',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Folder Name',
        },
      ],
    },
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
  ],
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [
    ...plugins,
    ...(process.env.BLOB_READ_WRITE_TOKEN?.startsWith('vercel_blob_rw_')
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  globals: [Header, Footer],
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
  endpoints: [
    createHomeEndpoint,
    {
      path: '/sync-etsy',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        try {
          const shopId = Number(process.env.ETSY_SHOP_ID) || 25894791
          const result = await syncEtsyListings(shopId, req.payload)
          return Response.json(result)
        } catch (error) {
          req.payload.logger.error({ err: error, msg: 'Error in /sync-etsy endpoint' })
          return Response.json({ error: 'Error syncing Etsy listings' }, { status: 500 })
        }
      },
    },
    {
      path: '/etsy/oauth/init',
      method: 'get',
      handler: async (req) => {
        const redirectUri = `${getServerSideURL()}/api/etsy/oauth/callback`
        const client = new EtsyClient(
          { redirectUri },
          new DefaultPayloadTokenRepository(req.payload),
        )
        const url = client.generateAuthUrl()
        return Response.redirect(url)
      },
    },
    {
      path: '/etsy/set-vacation',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        try {
          const shopId = Number(process.env.ETSY_SHOP_ID) || 25894791
          const redirectUri = `${getServerSideURL()}/api/etsy/oauth/callback`
          const client = new EtsyClient(
            { redirectUri },
            new DefaultPayloadTokenRepository(req.payload),
          )
          const data = await client.request<unknown>(`/shops/${shopId}`, {
            method: 'PUT',
            body: JSON.stringify({ is_vacation: false }),
          })
          return Response.json({ success: true, shop: data })
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },
    },
    {
      path: '/etsy/oauth/callback',
      method: 'get',
      handler: async (req) => {
        if (!req.url) {
          return Response.json({ error: 'Missing request URL' }, { status: 400 })
        }
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        if (!code) {
          return Response.json({ error: 'Missing authorization code' }, { status: 400 })
        }
        try {
          const redirectUri = `${getServerSideURL()}/api/etsy/oauth/callback`
          const client = new EtsyClient(
            { redirectUri },
            new DefaultPayloadTokenRepository(req.payload),
          )
          await client.completeAuthFlow(code)
          return Response.redirect('/admin')
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },
    },
  ],
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
