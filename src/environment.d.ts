declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Core (required at boot / runtime)
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      POSTGRES_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string

      // Media storage (Vercel Blob — required in production, optional locally)
      BLOB_READ_WRITE_TOKEN?: string

      // Auth / shared secrets
      CRON_SECRET?: string
      PREVIEW_SECRET?: string
      VERCEL_WEBHOOK_SECRET?: string

      // Etsy integration (read with fallbacks; required only when syncing)
      ETSY_API_KEY?: string
      ETSY_SHARED_SECRET?: string
      ETSY_REDIRECT_URI?: string
      ETSY_SHOP_ID?: string

      // Email / SMTP
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASS?: string
      EMAIL_FROM_ADDRESS?: string
      EMAIL_FROM_NAME?: string
      FORMSUBMIT_EMAIL?: string

      // Bot protection (Cloudflare Turnstile)
      TURNSTILE_SECRET_KEY?: string
      NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string

      // Logging
      LOG_LEVEL?: string

      // Vercel-injected (absent in local dev)
      VERCEL_URL?: string
      VERCEL_BRANCH_URL?: string
      VERCEL_ENV?: 'production' | 'preview' | 'development'

      // Seeding (used only by the seed scripts/endpoint)
      SEED_ADMIN_EMAIL?: string
      SEED_ADMIN_NAME?: string
      SEED_ADMIN_PASSWORD?: string
      SEED_DEMO_AUTHOR_EMAIL?: string
      SEED_DEMO_AUTHOR_NAME?: string
      SEED_DEMO_AUTHOR_PASSWORD?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
