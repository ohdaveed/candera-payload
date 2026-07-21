# Etsy sync history log — design

## Purpose

Today, running an Etsy sync produces only an ephemeral toast in the `EtsyIntegrationPanel` — the result vanishes on navigation or refresh, and a sync run outside the dashboard (`scripts/sync-etsy.ts`) leaves no trace at all. If a sync silently fails (auth expired, listings rejected, partial failures), nobody finds out until products visibly drift out of sync with Etsy. This project persists every sync run — however triggered — so failures are visible and auditable.

## Scope decisions

Confirmed with the project owner during brainstorming:

1. **Both trigger paths are logged**, not just the dashboard button. Sync has two entry points today — the dashboard's `/api/sync-etsy` endpoint and the CLI script (`scripts/sync-etsy.ts`) calling the sync engine directly — and logging only at the endpoint would silently miss every CLI-triggered run, defeating the point of the feature.
2. **No retention, pagination, or charts in v1.** Sync is manual and low-volume; a plain reverse-chronological list is enough. Revisit if volume changes.
3. **A logging failure must never turn a successful sync into a failed one.** The log write is wrapped separately from the sync itself.

## Architecture

Logging is added at the single shared choke point both trigger paths already pass through: `syncEtsyListings()` in `src/utilities/sync/adapters.ts`. The dashboard endpoint and the CLI script both call this function — wrapping it here means no current or future caller can bypass logging, and the pure `EtsySyncEngine` stays untouched (it doesn't gain a dependency on the logging collection).

```
dashboard button ─→ /api/sync-etsy ─┐
                                     ├─→ syncEtsyListings() ─→ engine.sync() ─→ log result ─→ return
CLI (sync-etsy.ts) ─────────────────┘
```

## Data model — new collection `etsy-sync-logs`

`src/collections/EtsySyncLogs.ts`, registered in `payload.config.ts` alongside `EtsyTokens`.

| Field | Type | Notes |
|---|---|---|
| `trigger` | select (`dashboard` \| `cli`) | Required. |
| `triggeredBy` | relationship → `users` | Optional — empty for CLI runs. |
| `success` | checkbox | Mirrors `SyncResult.success`. |
| `count` | number | Listings synced. |
| `failureCount` | number | Denormalized `failures.length`, so the list view is scannable without expanding the array. |
| `failures` | array of `{ listingId: number, error: text }` | Same shape the engine already returns. |
| `fatalError` | text, optional | Set only when the whole run throws before producing a `SyncResult` (e.g. Etsy auth failure) — distinct from per-listing failures. |

- `timestamps: true` — `createdAt` marks when the run finished.
- `admin.group: 'System'`, visible in nav (unlike `EtsyTokens`, which hides real secrets — a log has nothing to hide and admins should be able to browse full history).
- `admin.useAsTitle: 'createdAt'`, `admin.defaultColumns: ['trigger', 'success', 'count', 'failureCount', 'createdAt']`.
- Access: `read: isAdmin` (reuse `src/access/isAdmin.ts`); `create`/`update`/`delete: () => false` — rows are written server-side only, via the Local API.

## Trigger propagation & failure handling

`syncEtsyListings(source, payload, meta: { trigger: 'dashboard' | 'cli'; triggeredBy?: number | string })` — `meta` is a required parameter, not a hidden default, so both call sites are explicit about which path they are:

- `src/endpoints/etsy.ts` (`syncEtsyEndpoint`): passes `{ trigger: 'dashboard', triggeredBy: req.user.id }`.
- `scripts/sync-etsy.ts`: passes `{ trigger: 'cli' }` at both call sites (initial shop sync and the manual-listing-IDs fallback).

Inside `syncEtsyListings`:

- On a normal return (success or partial failure): write a log row matching the `SyncResult`, then return the result unchanged.
- On `engine.sync()` throwing (fatal error before any result exists): write a log row with `success: false`, `count: 0`, `fatalError: <message>`, then **rethrow** the original error — callers behave exactly as they do today (endpoint returns 500, CLI script's existing catch/exit logic is unaffected).
- The log write itself is wrapped in its own `try/catch`: a failure there is caught and reported via `syncLogger.error`, never allowed to replace or suppress the sync's own outcome.

## Dashboard UI

`EtsyIntegrationPanel` (`src/components/BeforeDashboard/EtsyIntegrationPanel.tsx`) is already a client component gated to admins via `useAuth()`. It gains:

- A fetch of the last 5 entries from `/api/etsy-sync-logs?limit=5&sort=-createdAt&depth=0` on mount.
- A refetch after `handleSync()` completes, so a just-triggered run appears immediately without a page reload.
- A compact list rendering, per row: relative timestamp, a trigger badge (Dashboard/CLI), a success/fail indicator, `count`, and `failureCount`. No inline expansion of the `failures` array in v1 — an admin who needs per-listing detail opens the `etsy-sync-logs` collection directly.

Full history browsing (all runs, not just the last 5) is the collection's own list view — not duplicated in the panel.

## Out of scope

- Retention/pruning of old log rows.
- Pagination or charting in the dashboard panel.
- Expanding `failures` inline in the dashboard panel (available in the collection detail view instead).
- Any change to the sync engine's core matching/upsert logic — this is additive logging only.

## Testing

- **Int test** (`tests/int/`): a successful sync writes one `etsy-sync-logs` row with the correct `trigger`/`success`/`count`/`failureCount`; a sync that throws before completing writes a `fatalError` row and still rethrows to the caller; a broken log write (simulated) does not alter or suppress the sync's own return value/throw.
- **Types & lint:** `pnpm generate:types`, `pnpm payload migrate:create` (new collection = schema change), `vp check`.
- **Manual verification via dev server:**
  1. Trigger a sync from the dashboard button; confirm a new row appears in the panel's recent-runs list and in the `etsy-sync-logs` collection, with `trigger: dashboard` and `triggeredBy` set to the logged-in user.
  2. Run `scripts/sync-etsy.ts` manually; confirm a row appears with `trigger: cli` and no `triggeredBy`.
  3. Confirm the panel and collection list are only visible/readable to admin-role users, not editors.
