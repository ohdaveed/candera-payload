/**
 * Migrates local media files from public/media/ to Vercel Blob storage.
 * Run once after enabling vercelBlobStorage when files were previously stored locally.
 *
 * Usage: npx tsx scripts/migrate-media-to-blob.ts
 */
import { put, list } from '@vercel/blob'
import { readFileSync, readdirSync } from 'fs'
import { join, extname } from 'path'
import { config } from 'dotenv'

config({ path: join(process.cwd(), '.env.local'), override: true })

const MEDIA_DIR = join(process.cwd(), 'public', 'media')
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

async function main() {
  if (!TOKEN?.startsWith('vercel_blob_rw_')) {
    console.error('BLOB_READ_WRITE_TOKEN not set or invalid')
    process.exit(1)
  }

  // Get existing blobs to skip already-uploaded files
  console.log('Fetching existing blobs...')
  const existing = new Set<string>()
  let cursor: string | undefined
  do {
    const res = await list({ token: TOKEN, limit: 1000, cursor })
    res.blobs.forEach((b) => existing.add(b.pathname))
    cursor = res.cursor
  } while (cursor)
  console.log(`Found ${existing.size} existing blobs`)

  const files = readdirSync(MEDIA_DIR)
  console.log(`Found ${files.length} local media files to process`)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const filename of files) {
    if (existing.has(filename)) {
      skipped++
      continue
    }

    const ext = extname(filename).toLowerCase()
    const mimeType = MIME_MAP[ext] ?? 'application/octet-stream'
    const filePath = join(MEDIA_DIR, filename)

    try {
      const buffer = readFileSync(filePath)
      await put(filename, buffer, {
        access: 'public',
        contentType: mimeType,
        token: TOKEN,
        addRandomSuffix: false,
      })
      uploaded++
      if (uploaded % 20 === 0) console.log(`Uploaded ${uploaded}/${files.length - skipped}...`)
    } catch (err) {
      failed++
      console.error(`Failed to upload ${filename}:`, (err as Error).message)
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
