import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function cleanup(): Promise<void> {
  const idsToDelete = [1717226844, 1731408433, 1731418441]
  
  console.log(`🧹 Cleaning up incorrect sync data...`)

  try {
    const payload = await getPayload({ config })
    
    for (const etsyId of idsToDelete) {
      const products = await payload.find({
        collection: 'products',
        where: {
          etsyListingId: { equals: etsyId }
        }
      })
      
      for (const product of products.docs) {
        await payload.delete({
          collection: 'products',
          id: product.id
        })
        console.log(`Deleted product: ${product.title} (Etsy ID: ${etsyId})`)
      }
      
      // Also cleanup media
      const media = await payload.find({
        collection: 'media',
        where: {
          etsyImageId: { exists: true } // Simplified: find all media with etsyImageId
        }
      })
      
      for (const m of media.docs) {
         // Since I know I just created them, I'll delete them if they match the naming pattern
         if (typeof m.filename === 'string' && m.filename.includes(`etsy-${etsyId}-`)) {
            await payload.delete({
              collection: 'media',
              id: m.id
            })
            console.log(`Deleted media: ${m.filename}`)
         }
      }
    }
    
    console.log(`✅ Cleanup completed.`)
  } catch (err) {
    console.error('❌ Error during cleanup:', err)
    process.exit(1)
  }
  process.exit(0)
}

cleanup()
