import 'dotenv/config'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncEtsyListings } from '../src/utilities/syncEtsy'

// Load .env.local
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })

async function runSync(): Promise<void> {
  const shopId = 25894791
  
  // These are verified listing IDs for CanderaCandles that work via the batch API
  const manualListingIds = [
    1717226844,
    1731408433,
    1731418441,
  ]

  console.log(`🌱 Initializing Payload and starting Etsy sync...`)

  try {
    const payload = await getPayload({ config })
    
    // Try syncing by shop ID first
    let result = await syncEtsyListings(shopId, payload)
    
    if (result.success && result.count === 0) {
      console.log(`⚠️  No active listings found for shop ${shopId}. Attempting manual sync with known IDs...`)
      result = await syncEtsyListings(manualListingIds, payload)
    }
    
    if (result.success) {
      console.log(`✅ Etsy sync completed successfully! Synced ${result.count} items.`)
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
