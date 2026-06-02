import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncEtsyListings } from '../src/utilities/syncEtsy'

async function runSync(): Promise<void> {
  const shopId = 25894791
  console.log(`🌱 Initializing Payload and starting Etsy sync for shop ${shopId}...`)

  try {
    const payload = await getPayload({ config })
    const result = await syncEtsyListings(shopId, payload)
    
    if (result.success) {
      console.log(`✅ Etsy sync completed successfully! Synced ${result.count} listings.`)
    } else {
      console.error('❌ Etsy sync failed.')
    }
  } catch (err) {
    console.error('❌ Error during Etsy sync:', err)
    process.exit(1)
  }
  process.exit(0)
}

runSync()
