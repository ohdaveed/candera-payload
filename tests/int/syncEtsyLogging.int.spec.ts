import { describe, it, expect, vi } from 'vite-plus/test'
import type { Payload } from 'payload'
import { runSyncAndLog } from '@/utilities/sync/logging'
import type { SyncResult } from '@/utilities/sync/types'

function makeFakePayload(createImpl?: () => Promise<unknown>) {
  return {
    create: vi.fn(createImpl ?? (async () => ({ id: 'log-1' }))),
  }
}

describe('runSyncAndLog', () => {
  it('logs a successful run and returns the result unchanged', async () => {
    const fake = makeFakePayload()
    const result: SyncResult = { success: true, count: 3, failures: [] }
    const sync = vi.fn(async () => result)

    const returned = await runSyncAndLog(sync, fake as unknown as Payload, {
      trigger: 'dashboard',
      triggeredBy: 42,
    })

    expect(returned).toEqual(result)
    expect(fake.create).toHaveBeenCalledWith({
      collection: 'etsy-sync-logs',
      data: {
        trigger: 'dashboard',
        triggeredBy: 42,
        success: true,
        count: 3,
        failureCount: 0,
        failures: [],
      },
    })
  })

  it('logs a partial-failure run with the correct failureCount', async () => {
    const fake = makeFakePayload()
    const result: SyncResult = {
      success: false,
      count: 2,
      failures: [{ listingId: 1, error: 'bad title' }],
    }
    const sync = vi.fn(async () => result)

    const returned = await runSyncAndLog(sync, fake as unknown as Payload, { trigger: 'cli' })

    expect(returned).toEqual(result)
    expect(fake.create).toHaveBeenCalledWith({
      collection: 'etsy-sync-logs',
      data: {
        trigger: 'cli',
        triggeredBy: undefined,
        success: false,
        count: 2,
        failureCount: 1,
        failures: [{ listingId: 1, error: 'bad title' }],
      },
    })
  })

  it('logs a fatalError and rethrows when sync() throws before returning', async () => {
    const fake = makeFakePayload()
    const sync = vi.fn(async () => {
      throw new Error('Etsy auth expired')
    })

    await expect(
      runSyncAndLog(sync, fake as unknown as Payload, { trigger: 'cli' }),
    ).rejects.toThrow('Etsy auth expired')

    expect(fake.create).toHaveBeenCalledWith({
      collection: 'etsy-sync-logs',
      data: {
        trigger: 'cli',
        triggeredBy: undefined,
        success: false,
        count: 0,
        failureCount: 0,
        failures: [],
        fatalError: 'Etsy auth expired',
      },
    })
  })

  it('does not let a broken log write change the returned result', async () => {
    const fake = makeFakePayload(async () => {
      throw new Error('DB unavailable')
    })
    const result: SyncResult = { success: true, count: 5, failures: [] }
    const sync = vi.fn(async () => result)

    const returned = await runSyncAndLog(sync, fake as unknown as Payload, {
      trigger: 'dashboard',
    })

    expect(returned).toEqual(result)
  })

  it('does not let a broken log write swallow or replace the original thrown error', async () => {
    const fake = makeFakePayload(async () => {
      throw new Error('DB unavailable')
    })
    const sync = vi.fn(async () => {
      throw new Error('Etsy auth expired')
    })

    await expect(
      runSyncAndLog(sync, fake as unknown as Payload, { trigger: 'cli' }),
    ).rejects.toThrow('Etsy auth expired')
  })
})
