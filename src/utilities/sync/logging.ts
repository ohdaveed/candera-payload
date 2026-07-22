import type { Payload } from 'payload'
import { syncLogger } from '../logger'
import type { SyncResult } from './types'

export type SyncTrigger = 'dashboard' | 'cli'

export interface SyncRunMeta {
  trigger: SyncTrigger
  triggeredBy?: number
}

interface SyncLogData extends SyncRunMeta {
  success: boolean
  count: number
  failureCount: number
  failures: SyncResult['failures']
  fatalError?: string
}

// Runs `sync`, persists an `etsy-sync-logs` row describing the outcome, and
// returns/rethrows exactly what `sync` returned/threw. A failure while writing
// the log itself is caught and logged — it must never change the sync's own
// outcome (see writeSyncLog).
export async function runSyncAndLog(
  sync: () => Promise<SyncResult>,
  payload: Payload,
  meta: SyncRunMeta,
): Promise<SyncResult> {
  try {
    const result = await sync()
    await writeSyncLog(payload, {
      trigger: meta.trigger,
      triggeredBy: meta.triggeredBy,
      success: result.success,
      count: result.count,
      failureCount: result.failures.length,
      failures: result.failures,
    })
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await writeSyncLog(payload, {
      trigger: meta.trigger,
      triggeredBy: meta.triggeredBy,
      success: false,
      count: 0,
      failureCount: 0,
      failures: [],
      fatalError: message,
    })
    throw err
  }
}

// The collection's `create: () => false` blocks the REST/GraphQL API, not this
// Local API call — Local API defaults to `overrideAccess: true`, which is what
// lets a server-only write like this one succeed at all.
async function writeSyncLog(payload: Payload, data: SyncLogData): Promise<void> {
  try {
    await payload.create({
      collection: 'etsy-sync-logs',
      data,
    })
  } catch (err) {
    syncLogger.error('Failed to write etsy-sync-logs entry:', err)
  }
}
