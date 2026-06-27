import 'dotenv/config'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
import { execSync } from 'child_process'
import { consola } from 'consola'

// Ensure we load .env.local with override for the new database URL
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function initNewDb() {
  const dbUrl = process.env.DATABASE_URI || process.env.DATABASE_URL || process.env.POSTGRES_URL

  consola.info('🚀 Starting Candera Database Initialization...')

  if (!dbUrl) {
    consola.error(
      'DATABASE_URL is not set. Please update your .env.local file with the new database connection string.',
    )
    process.exit(1)
  }

  consola.info(`Target Database: ${dbUrl.split('@')[1] || 'Unknown'}`)

  try {
    // 1. Run Migrations
    consola.start('Running schema migrations...')
    execSync('npx payload migrate', { stdio: 'inherit' })
    consola.success('Schema migrated successfully.')

    // 2. Seed Admin User
    consola.start('Seeding admin user...')
    execSync('npx tsx scripts/seed-admin.ts', { stdio: 'inherit' })
    consola.success('Admin user created.')

    // 3. Seed Core Content
    consola.start('Seeding core database content...')
    execSync('npx tsx scripts/seed-db.ts', { stdio: 'inherit' })
    consola.success('Core content seeded.')

    // 4. Initial Etsy Sync
    consola.start('Running initial Etsy synchronization...')
    execSync('npx tsx scripts/sync-etsy.ts', { stdio: 'inherit' })
    consola.success('Etsy sync completed.')

    consola.box({
      title: 'Initialization Complete!',
      message:
        'The new Candera database is now fully configured and synchronized.\nYou can now run "pnpm dev" to start the application.',
      style: {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'double',
      },
    })
  } catch (err) {
    consola.error('Initialization failed during one of the steps.')
    consola.error(err)
    process.exit(1)
  }
}

await initNewDb()
