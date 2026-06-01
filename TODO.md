# Code Review Action Items

## 1. Backend Integration & Data Flow
- [x] **Slug Collision Risk in Etsy Sync**: Update `src/utilities/syncEtsy.ts` to append `etsyListingId` to the slug (e.g., `title-123456789`).
- [x] **Error Handling**: Add try/catch or error handling for `syncEtsyListings` inside the `/sync-etsy` endpoint in `src/payload.config.ts`.

## 2. API Design & Network Calls
- [x] **Search Pagination Logic**: Fix `posts.totalDocs` access in `src/app/(frontend)/search/page.tsx` when `pagination: false` is set.
- [x] **Manual Relationship Fetching**: Optimize `src/search/beforeSync.ts` to fetch all category titles in a single query using an `in` operator instead of a loop.

## 3. UX/UI Implementation & Performance
- [x] **Image Bloat**: Reduce Next.js Image `quality` from 100 to 80 in `src/components/Media/ImageMedia/index.tsx`.
- [x] **Form Latency**: Remove the artificial 1-second `setTimeout` delay in `src/blocks/Form/Component.tsx` loading indicator.
- [x] **Type Safety**: Remove the `any` type and properly type the `Field` component in `src/blocks/Form/Component.tsx`.

## 4. Maintenance & Feature Expansion
- [x] **Fix ESLint Circular Structure**: Resolved by migrating to native flat configs in `eslint.config.mjs` (Next.js 15+ compatible).
- [x] **Expand Etsy Sync**: Updated `src/utilities/syncEtsy.ts` to sync listing `description` (RichText conversion) and main listing images to the `media` collection. Added `etsyImageId` to `Media` collection for idempotency.
- [x] **Fix React 19 Lint Errors**: Resolved synchronous `setState` in effects using `startTransition` and fixed ref access during render in `Card` component.
- [x] **Project-wide Warning Cleanup**: Fixed all remaining 18 ESLint warnings across migrations, seed files, and tests.
