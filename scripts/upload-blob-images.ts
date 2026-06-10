import 'dotenv/config'
import { put, list } from '@vercel/blob'
import { readFileSync } from 'fs'
import { join } from 'path'

const IMAGES = [
  { name: 'seashell-garden', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'meadowlight-botanical', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'crimson-noir', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'ever-after-glow', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'anyas-eyes', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'scarlet-bloom', ext: 'jpg', mime: 'image/jpeg' },
  { name: 'minimalist-airy-about', ext: 'png', mime: 'image/png' },
  { name: 'minimalist-airy-home', ext: 'png', mime: 'image/png' },
]

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN is not set')
    process.exit(1)
  }

  // List existing blobs so we can skip already-uploaded files
  const existing = new Set<string>()
  let cursor: string | undefined
  do {
    const page = await list({ token, cursor })
    for (const blob of page.blobs) {
      existing.add(blob.pathname)
    }
    cursor = page.cursor
  } while (cursor)

  console.log(`Found ${existing.size} existing blobs in store`)

  for (const { name, ext, mime } of IMAGES) {
    const filename = `${name}.${ext}`
    const pathname = `candera/${filename}`

    if (existing.has(pathname)) {
      console.log(`  skip  ${pathname} (already exists)`)
      continue
    }

    const filePath = join(process.cwd(), 'public', 'candera', filename)
    const data = readFileSync(filePath)

    const result = await put(pathname, data, {
      access: 'public',
      contentType: mime,
      token,
    })

    console.log(`  ✓  ${pathname}  →  ${result.url}`)
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Upload failed:', err)
  process.exit(1)
})
