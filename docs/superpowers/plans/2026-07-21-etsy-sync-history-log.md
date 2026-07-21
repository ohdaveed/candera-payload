# Etsy Sync History Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every Etsy sync run — whether triggered from the admin dashboard button or the CLI script — as a row in a new `etsy-sync-logs` collection, and surface the last 5 runs in the dashboard's Etsy panel, so a sync failure is never silently missed.

**Architecture:** A new `runSyncAndLog()` wrapper in `src/utilities/sync/logging.ts` sits around the existing `syncEtsyListings()` production entry point (`src/utilities/sync/adapters.ts`) — the single choke point both trigger paths (`/api/sync-etsy` endpoint and `scripts/sync-etsy.ts`) already call. It writes one `etsy-sync-logs` row per run (success, partial failure, or fatal throw) without changing what callers receive back. The pure `EtsySyncEngine` is untouched.

**Tech Stack:** Payload CMS 3.85 collections/access-control, TypeScript, Vitest (`vite-plus/test`) for int tests, React (client component) for the dashboard panel.

## Global Constraints

- New collection = schema change → both `pnpm generate:types` and `pnpm payload migrate:create` must be run and committed (per repo commit-hygiene rule).
- Regenerate `pnpm generate:importmap` after any admin-visible config change and only commit it if it actually diffs — never let it ride along stale or unnecessarily touched.
- Commands that need secrets/DB env vars run as `pass-cli run --env-file .env -- <command>` (never invoke `payload`/`vp` directly without this wrapper in this repo).
- A log-write failure must never change or suppress the sync's own returned result or thrown error.
- No retention/pruning, pagination, or charts in this feature — out of scope per the design doc.
- Prettier: single quotes, no semicolons, trailing commas, 100-width — match existing file style exactly.

---

### Task 1: Create the `etsy-sync-logs` collection and register it

**Files:**
- Create: `src/collections/EtsySyncLogs.ts`
- Modify: `src/payload.config.ts:37` (import), `src/payload.config.ts:139` (collections array)
- Generated (do not hand-edit): `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js` (only if it diffs), a new file under `src/migrations/`

**Interfaces:**
- Produces: a Payload collection slug `'etsy-sync-logs'` with fields `trigger: 'dashboard' | 'cli'`, `triggeredBy?: number | User`, `success: boolean`, `count: number`, `failureCount: number`, `failures: Array<{ listingId: number; error: string }>`, `fatalError?: string`, plus Payload's standard `id`/`createdAt`/`updatedAt`. Task 2 and Task 3 write to this collection via `payload.create({ collection: 'etsy-sync-logs', data })`; Task 4 reads it via the auto-generated REST endpoint `/api/etsy-sync-logs`.

- [ ] **Step 1: Create the collection file**

```ts
// src/collections/EtsySyncLogs.ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const EtsySyncLogs: CollectionConfig = {
  slug: 'etsy-sync-logs',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['trigger', 'success', 'count', 'failureCount', 'createdAt'],
    group: 'System',
    description:
      'History of Etsy sync runs, however triggered. Written automatically — not editable.',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'trigger',
      type: 'select',
      required: true,
      options: [
        { label: 'Dashboard', value: 'dashboard' },
        { label: 'CLI', value: 'cli' },
      ],
      admin: {
        description: 'How this sync run was started.',
      },
    },
    {
      name: 'triggeredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin user who clicked Sync in the dashboard. Empty for CLI-triggered runs.',
      },
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Listings synced during this run.',
      },
    },
    {
      name: 'failureCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Number of per-listing failures during this run.',
      },
    },
    {
      name: 'failures',
      type: 'array',
      fields: [
        { name: 'listingId', type: 'number', required: true },
        { name: 'error', type: 'text', required: true },
      ],
      admin: {
        description: 'Per-listing failures for this run, if any.',
      },
    },
    {
      name: 'fatalError',
      type: 'text',
      admin: {
        description:
          'Set only when the whole run threw before completing (e.g. an Etsy auth failure) — distinct from the per-listing failures above.',
      },
    },
  ],
  timestamps: true,
}
```

- [ ] **Step 2: Register the collection in `payload.config.ts`**

Add the import next to the other collection imports (after `import { EtsyTokens } from './collections/EtsyTokens'` on line 37):

```ts
import { EtsySyncLogs } from './collections/EtsySyncLogs'
```

Add it to the `collections` array, directly after `EtsyTokens`:

```ts
  collections: [
    Folders,
    Pages,
    Posts,
    Products,
    Media,
    Categories,
    Users,
    EtsyTokens,
    EtsySyncLogs,
    Briefs,
    Quizzes,
    ScentProfiles,
    Documentation,
    HowToGuides,
    Events,
  ],
```

- [ ] **Step 3: Generate types**

Run: `pass-cli run --env-file .env -- pnpm generate:types`
Expected: exits 0; `src/payload-types.ts` now contains an `EtsySyncLog` interface and `'etsy-sync-logs': EtsySyncLog` in `Config['collections']`.

- [ ] **Step 4: Create the migration**

Run: `pass-cli run --env-file .env -- pnpm payload migrate:create add_etsy_sync_logs`
Expected: exits 0; a new `src/migrations/<timestamp>_add_etsy_sync_logs.ts` and matching `.json` are created, containing a `CREATE TABLE "etsy_sync_logs"` (and its `failures` array join table) plus the `enum_etsy_sync_logs_trigger` enum.

- [ ] **Step 5: Regenerate the import map and check for a real diff**

Run: `pass-cli run --env-file .env -- pnpm generate:importmap && git status --short src/app/\(payload\)/admin/importMap.js`
Expected: command exits 0. If `git status` shows the file as modified, it will be included in this task's commit (Step 6). If it shows nothing, the collection introduced no new admin-visible components and the file is left untouched.

- [ ] **Step 6: Commit**

```bash
git add src/collections/EtsySyncLogs.ts src/payload.config.ts src/payload-types.ts src/migrations/
git add "src/app/(payload)/admin/importMap.js" 2>/dev/null || true
git commit -m "feat(admin): add etsy-sync-logs collection"
```

---

### Task 2: `runSyncAndLog()` helper with int tests

**Files:**
- Create: `src/utilities/sync/logging.ts`
- Create: `tests/int/syncEtsyLogging.int.spec.ts`

**Interfaces:**
- Consumes: `SyncResult` from `./types` (`src/utilities/sync/types.ts`) — `{ success: boolean; count: number; failures: Array<{ listingId: number; error: string }> }`. The `'etsy-sync-logs'` collection slug and field shape from Task 1.
- Produces: `runSyncAndLog(sync: () => Promise<SyncResult>, payload: Payload, meta: SyncRunMeta): Promise<SyncResult>` and `type SyncTrigger = 'dashboard' | 'cli'`, `interface SyncRunMeta { trigger: SyncTrigger; triggeredBy?: number | string }` — all exported from `src/utilities/sync/logging.ts`. Task 3 imports and calls these.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/int/syncEtsyLogging.int.spec.ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pass-cli run --env-file .env -- vp test run --config ./vitest.config.mts tests/int/syncEtsyLogging.int.spec.ts`
Expected: FAIL — `Cannot find module '@/utilities/sync/logging'` (the file doesn't exist yet).

- [ ] **Step 3: Implement `runSyncAndLog`**

```ts
// src/utilities/sync/logging.ts
import type { Payload } from 'payload'
import { syncLogger } from '../logger'
import type { SyncResult } from './types'

export type SyncTrigger = 'dashboard' | 'cli'

export interface SyncRunMeta {
  trigger: SyncTrigger
  triggeredBy?: number | string
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pass-cli run --env-file .env -- vp test run --config ./vitest.config.mts tests/int/syncEtsyLogging.int.spec.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utilities/sync/logging.ts tests/int/syncEtsyLogging.int.spec.ts
git commit -m "feat(etsy-sync): add runSyncAndLog wrapper with int tests"
```

---

### Task 3: Wire logging into `syncEtsyListings` and update both call sites

**Files:**
- Modify: `src/utilities/sync/adapters.ts` (the `syncEtsyListings` function at the bottom of the file)
- Modify: `src/endpoints/etsy.ts` (`syncEtsyEndpoint` handler)
- Modify: `scripts/sync-etsy.ts` (both `syncEtsyListings` calls)

**Interfaces:**
- Consumes: `runSyncAndLog`, `SyncRunMeta` from `src/utilities/sync/logging.ts` (Task 2).
- Produces: `syncEtsyListings(source: number | number[], payload: Payload, meta: SyncRunMeta): Promise<SyncResult>` — the `meta` parameter is now required at every call site. No other exported signature changes.

- [ ] **Step 1: Update `syncEtsyListings` in `src/utilities/sync/adapters.ts`**

Add the import at the top of the file, next to the other local imports:

```ts
import { runSyncAndLog, type SyncRunMeta } from './logging'
```

Replace the existing `syncEtsyListings` function (the `// ORIGINAL SHALLOW ENTRY POINT` section at the bottom of the file) with:

```ts
export async function syncEtsyListings(
  source: number | number[],
  payload: Payload,
  meta: SyncRunMeta,
) {
  return runSyncAndLog(
    async () => {
      const tokenRepository = new DefaultPayloadTokenRepository(payload)
      const client = new EtsyClient(undefined, tokenRepository)

      const isBatch = Array.isArray(source)
      const syncSource: SyncSource = isBatch
        ? { type: 'listings', listingIds: source }
        : { type: 'shop', shopId: source }

      // Build the editor config once, then convert each Etsy description with
      // Payload's official Markdown→Lexical converter so bullet lists, headings, and
      // paragraphs become real Lexical nodes instead of one paragraph per line.
      const editorConfig = await editorConfigFactory.default({ config: payload.config })

      const engine = new EtsySyncEngine()
      const ports = {
        etsySource: new ProductionEtsySourceAdapter(client),
        productStore: new ProductionProductStoreAdapter(payload),
        mediaStorage: new ProductionMediaStorageAdapter(payload),
        logger: syncLogger,
        descriptionToRichText: (markdown: string) =>
          convertMarkdownToLexical({ editorConfig, markdown }) as unknown as Product['description'],
      }

      const result = await engine.sync(syncSource, ports)
      return {
        success: result.success,
        count: result.count,
        failures: result.failures,
      }
    },
    payload,
    meta,
  )
}
```

- [ ] **Step 2: Pass `{ trigger: 'dashboard', triggeredBy }` from the endpoint**

In `src/endpoints/etsy.ts`, inside `syncEtsyEndpoint.handler`, change:

```ts
      const result = await syncEtsyListings(getEtsyShopId(), req.payload)
```

to:

```ts
      const result = await syncEtsyListings(getEtsyShopId(), req.payload, {
        trigger: 'dashboard',
        triggeredBy: req.user?.id,
      })
```

- [ ] **Step 3: Pass `{ trigger: 'cli' }` from the CLI script**

In `scripts/sync-etsy.ts`, change:

```ts
    let result = await syncEtsyListings(shopId, payload)
```

to:

```ts
    let result = await syncEtsyListings(shopId, payload, { trigger: 'cli' })
```

and change:

```ts
      result = await syncEtsyListings(manualListingIds, payload)
```

to:

```ts
      result = await syncEtsyListings(manualListingIds, payload, { trigger: 'cli' })
```

- [ ] **Step 4: Run the full Etsy sync test suite to confirm nothing broke**

Run: `pass-cli run --env-file .env -- vp test run --config ./vitest.config.mts tests/int/syncEtsy.int.spec.ts tests/int/syncEtsyLogging.int.spec.ts`
Expected: PASS — all existing engine/adapter tests plus the new logging tests are green (the engine and adapter classes tested in `syncEtsy.int.spec.ts` are unaffected by this change; only the shallow `syncEtsyListings` entry point, which that file doesn't call directly, changed).

- [ ] **Step 5: Type-check**

Run: `pass-cli run --env-file .env -- vp check`
Expected: exits 0, no type errors from the new required `meta` parameter at either call site.

- [ ] **Step 6: Commit**

```bash
git add src/utilities/sync/adapters.ts src/endpoints/etsy.ts scripts/sync-etsy.ts
git commit -m "feat(etsy-sync): thread trigger metadata through both sync call sites"
```

---

### Task 4: Show recent sync history in the dashboard panel

**Files:**
- Modify: `src/components/BeforeDashboard/EtsyIntegrationPanel.tsx` (full replacement below)

**Interfaces:**
- Consumes: the auto-generated Payload REST endpoint `GET /api/etsy-sync-logs?limit=5&sort=-createdAt&depth=0` (from Task 1's collection), returning `{ docs: EtsySyncLog[] }`; the `EtsySyncLog` type from `@/payload-types` (generated in Task 1).
- Produces: no new exports — this is a leaf UI component.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/BeforeDashboard/EtsyIntegrationPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import type { EtsySyncLog } from '@/payload-types'
import { SectionTooltip } from './SectionTooltip'

type SyncResponse = {
  success?: boolean
  count?: number
  failures?: string[]
  error?: string
}

function userIsAdmin(user: unknown): boolean {
  return Boolean(
    user &&
    typeof user === 'object' &&
    'roles' in user &&
    Array.isArray((user as { roles?: string[] }).roles) &&
    (user as { roles: string[] }).roles.includes('admin'),
  )
}

async function fetchRecentSyncLogs(): Promise<EtsySyncLog[]> {
  const res = await fetch('/api/etsy-sync-logs?limit=5&sort=-createdAt&depth=0', {
    credentials: 'include',
  })
  if (!res.ok) return []
  const data = (await res.json()) as { docs?: EtsySyncLog[] }
  return data.docs ?? []
}

export function EtsyIntegrationPanel() {
  const { user } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<EtsySyncLog[]>([])

  useEffect(() => {
    if (!userIsAdmin(user)) return
    void fetchRecentSyncLogs().then(setLogs)
  }, [user])

  if (!userIsAdmin(user)) {
    return null
  }

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setStatus(null)

    try {
      const res = await fetch('/api/sync-etsy', { credentials: 'include' })
      const data = (await res.json()) as SyncResponse

      if (!res.ok) {
        throw new Error(data.error || `Sync failed (${res.status})`)
      }

      const failureCount = data.failures?.length ?? 0
      setStatus(
        failureCount > 0
          ? `Synced ${data.count ?? 0} listings with ${failureCount} warning(s).`
          : `Synced ${data.count ?? 0} listings successfully.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
      void fetchRecentSyncLogs().then(setLogs)
    }
  }

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
      >
        <h2
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--theme-elevation-700)',
            margin: 0,
          }}
        >
          Etsy Integration
        </h2>
        <SectionTooltip
          title="Etsy Integration"
          content="Connect your Etsy shop and sync listings into Products. OAuth is required before the first sync."
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <a
          href="/api/etsy/oauth/init"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-text)',
            textDecoration: 'none',
          }}
        >
          Connect Etsy
        </a>

        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={syncing}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-100)',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? 'Syncing…' : 'Sync Listings'}
        </button>
      </div>

      {status && (
        <p
          style={{
            marginTop: '0.75rem',
            marginBottom: 0,
            fontSize: '0.8125rem',
            color: 'var(--theme-success-500, #22c55e)',
          }}
        >
          {status}
        </p>
      )}

      {error && (
        <p
          style={{
            marginTop: '0.75rem',
            marginBottom: 0,
            fontSize: '0.8125rem',
            color: 'var(--theme-error-500)',
          }}
        >
          {error}
        </p>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--theme-elevation-600)',
              margin: '0 0 0.5rem 0',
            }}
          >
            Recent Syncs
          </p>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            {logs.map((log) => (
              <li
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--theme-elevation-700)',
                }}
              >
                <span
                  style={{
                    color: log.success
                      ? 'var(--theme-success-500, #22c55e)'
                      : 'var(--theme-error-500)',
                    fontWeight: 600,
                  }}
                >
                  {log.success ? '✓' : '✕'}
                </span>
                <span style={{ textTransform: 'capitalize' }}>{log.trigger}</span>
                <span>· {log.count} synced</span>
                {log.failureCount > 0 && <span>· {log.failureCount} failed</span>}
                <span style={{ color: 'var(--theme-elevation-500)' }}>
                  · {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Type-check and lint**

Run: `pass-cli run --env-file .env -- vp check`
Expected: exits 0, no type or lint errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/BeforeDashboard/EtsyIntegrationPanel.tsx
git commit -m "feat(admin): show recent Etsy sync history in dashboard panel"
```

- [ ] **Step 4: Manual verification via dev server**

Run: `pass-cli run --env-file .env -- pnpm dev` (skip if already running — do not kill an existing dev server).

1. Log in to `/admin` as an admin user. On the dashboard, click **Sync Listings** in the Etsy Integration panel. Confirm a "Recent Syncs" list appears below the status message, showing the run that just completed (trigger: Dashboard, correct count).
2. Open `/admin/collections/etsy-sync-logs` and confirm the same run appears there with `triggeredBy` set to the logged-in admin.
3. In a separate terminal, run `pass-cli run --env-file .env -- pnpm tsx scripts/sync-etsy.ts`. Confirm a new row appears in `/admin/collections/etsy-sync-logs` with `trigger: cli` and an empty `triggeredBy`.
4. Log in as a non-admin (editor-role) user and confirm `/admin/collections/etsy-sync-logs` is not visible in the nav and returns a 403/empty result if navigated to directly.
