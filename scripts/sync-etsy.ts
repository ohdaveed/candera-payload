import 'dotenv/config'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncEtsyListings } from '../src/utilities/syncEtsy'
import { etsyLogger, syncLogger } from '@/utilities/logger'

// Load .env.local
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function runSync(): Promise<void> {
  const shopId = Number(process.env.ETSY_SHOP_ID) || 25894791

  // These are verified listing IDs for CanderaCandles that work via the batch API
  const manualListingIds = [1717226844, 1731408433, 1731418441]

  syncLogger.info('Initializing Payload and starting Etsy sync...')

  try {
    const payload = await getPayload({ config })

    // Try syncing by shop ID first
    let result = await syncEtsyListings(shopId, payload)

    if (result.success && result.count === 0) {
      etsyLogger.warn(
        `No active listings found for shop ${shopId}. Attempting manual sync with known IDs...`,
      )
      result = await syncEtsyListings(manualListingIds, payload)
    }

    if (result.success) {
      syncLogger.success(`Etsy sync completed successfully! Synced ${result.count} items.`)
    } else {
      syncLogger.error(
        `Etsy sync completed with ${result.failures.length} failure(s) (synced ${result.count}).`,
      )
      for (const failure of result.failures) {
        syncLogger.error(`  • listing ${failure.listingId}: ${failure.error}`)
      }
    }
  } catch (err) {
    syncLogger.error('Error during Etsy sync:', err)
    process.exit(1)
  }
  process.exit(0)
}

await runSync()
