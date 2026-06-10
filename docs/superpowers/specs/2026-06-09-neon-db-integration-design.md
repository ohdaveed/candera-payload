# Neon DB Integration — Design Spec

**Date:** 2026-06-09  
**Approach:** Thin Neon layer alongside Payload (Approach A)  
**Scope:** Client foundation → enhanced search → form Server Action

---

## Context

The project uses Payload CMS with `@payloadcms/db-vercel-postgres` as the ORM, backed by a Neon PostgreSQL database. `@neondatabase/serverless ^1.1.0` is already installed. All Payload-managed tables live in the `public` schema.

Currently:
- Search queries go through `payload.find({ collection: 'search' })` — adds ORM overhead for a read-only operation
- Form submissions go through `POST /api/form-submissions` — an extra HTTP round trip from the client

This spec adds a thin direct-Neon layer for both cases without touching Payload's role as the content management and schema ownership layer.

---

## Architecture

```
src/
  lib/
    db.ts                        # Neon client — single source of truth
    queries/
      search.ts                  # searchContent() query function
  app/
    actions/
      submitForm.ts              # Server Action for form submission
    (frontend)/
      search/
        page.tsx                 # Updated: uses searchContent() instead of payload.find()
  components/
    ContactForm/
      index.tsx                  # Updated: calls submitForm() instead of fetch()
  app/
    (frontend)/
      contact/
        page.tsx                 # Minor: passes form id as number (was string)
```

---

## Section 1 — Neon Client (`src/lib/db.ts`)

### What it does
Initializes the `@neondatabase/serverless` `neon()` tagged-template function from `process.env.DATABASE_URL` and exports it as `sql`.

### Implementation
```ts
import { neon } from '@neondatabase/serverless'
export const sql = neon(process.env.DATABASE_URL!)
```

### Constraints
- `DATABASE_URL` is already declared in `src/environment.d.ts` — no new env var needed
- `neon()` is stateless and safe to call at module scope in serverless environments
- No connection pooling needed — each serverless invocation gets a fresh HTTP connection

---

## Section 2 — Search Query (`src/lib/queries/search.ts`)

### What it does
Exports `searchContent(query: string): Promise<SearchResult[]>` — a typed function that queries `public.search` with a LEFT JOIN to `public.media` for image data.

### Schema relied upon
```
public.search:        id, title, slug, priority, meta_title, meta_description, meta_image_id, created_at
public.media:         id, url, alt, width, height
Index: search_slug_idx ON search(slug)   -- used for ORDER BY / exact lookup
```

### Query
```sql
SELECT
  s.id, s.title, s.slug, s.meta_title, s.meta_description,
  m.url  AS meta_image_url,
  m.alt  AS meta_image_alt,
  m.width  AS meta_image_width,
  m.height AS meta_image_height
FROM   search s
LEFT JOIN media m ON s.meta_image_id = m.id
WHERE  s.title           ILIKE $1
    OR s.meta_description ILIKE $1
    OR s.meta_title       ILIKE $1
    OR s.slug             ILIKE $1
ORDER  BY s.priority DESC NULLS LAST, s.created_at DESC
LIMIT  12
```

The `$1` parameter is `%${query}%` (wrapped in wildcards by the function, not the caller).

### Return type
```ts
type SearchResult = {
  id: number
  title: string | null
  slug: string | null
  meta_title: string | null
  meta_description: string | null
  meta_image_url: string | null
  meta_image_alt: string | null
  meta_image_width: number | null
  meta_image_height: number | null
}
```

### Guard
If `query.trim()` is empty, return `[]` without a DB call.

### Mapping to `CardPostData`
The search page maps `SearchResult[]` to `CardPostData[]` for `CollectionArchive`. Mapping:
- `title` → `title`
- `slug` → `slug`
- `meta_description`, `meta_image_url/alt/width/height` → `meta.description`, `meta.image`
- All product-specific fields (`scentProfile`, `burnTime`, etc.) → `undefined`

---

## Section 3 — Search Page Update (`src/app/(frontend)/search/page.tsx`)

### What changes
- Remove `getPayload`, `configPromise`, `payload.find()` imports and call
- Import `searchContent` from `@/lib/queries/search`
- Call `searchContent(query)` to get results
- Map `SearchResult[]` → `CardPostData[]` inline
- Pass mapped results to `CollectionArchive` — no change to that component

### What stays the same
- `PageClient`, `Search` component, `PageHeader`
- Empty state (no results) and no-query state UI
- `generateMetadata`

---

## Section 4 — Form Server Action (`src/app/actions/submitForm.ts`)

### What it does
Exports `submitForm(formId: number, submissionData: { field: string; value: string }[]): Promise<{ ok: true } | { ok: false; error: string }>`.

### Schema relied upon
```
public.form_submissions:
  id (serial PK), form_id (int FK → forms.id), updated_at, created_at

public.form_submissions_submission_data:
  id (varchar PK), _order (int), _parent_id (int FK → form_submissions.id),
  field (varchar), value (varchar)
Index: form_submissions_form_idx ON form_submissions(form_id)
```

### Write strategy
`neon().transaction()` is non-interactive — all queries must be built upfront as an array, so the result of one cannot feed into the next within the same call. The write is split into two round trips:

1. **Standalone INSERT** into `form_submissions` → returns the new `id`
2. **Transaction array** of INSERT statements into `form_submissions_submission_data`, one per field, all using the `id` from step 1

```ts
'use server'

// Round trip 1: create the parent submission record
const [row] = await sql`
  INSERT INTO form_submissions (form_id, updated_at, created_at)
  VALUES (${formId}, NOW(), NOW())
  RETURNING id
`
const submissionId = row.id as number

// Round trip 2: atomically insert all field rows
await sql.transaction(
  submissionData.map((item, i) => sql`
    INSERT INTO form_submissions_submission_data
      (_order, _parent_id, id, field, value)
    VALUES (${i}, ${submissionId}, ${crypto.randomUUID()}, ${item.field}, ${item.value})
  `)
)
```

If round trip 2 fails, the parent `form_submissions` row is orphaned (visible in admin with no field data). This is an acceptable edge case for a contact form — data is not partially visible to the user and an admin can identify and clean it up.

### Error handling
- Wraps everything in try/catch
- Returns `{ ok: false, error: 'Something went wrong.' }` on any DB error — never leaks DB error messages to the client
- Returns `{ ok: true }` on success

### Validation
- `formId` must be a positive integer — throws early with `{ ok: false, error: 'Invalid form.' }` if not
- `submissionData` must be a non-empty array

---

## Section 5 — ContactForm Update (`src/components/ContactForm/index.tsx`)

### What changes
- Remove `fetch('/api/form-submissions', ...)` and all related headers/response parsing
- Import `submitForm` from `@/app/actions/submitForm`
- `formId` prop type changes from `string` to `number`
- `onSubmit` calls `await submitForm(formId, [...])` directly
- Handle `result.ok === false` as the error path

### Contact page (`src/app/(frontend)/contact/page.tsx`)
- `formsResult.docs[0]?.id` is already a `number` in Payload — remove the `.toString()` cast
- Pass it directly as `formId={contactFormId}` (now typed as `number`)

### What stays the same
- All form fields, validation rules, labels, `react-hook-form` setup
- Success state UI
- Error state UI (same visual treatment, different data source)
- `variant="cta-ember"` CTA button

---

## Out of Scope

- Mailchimp integration (already handled separately in `src/services/mailchimp.ts`)
- InnerCircle email form — uses a different form id but same component pattern; can be migrated in a follow-up once ContactForm pattern is proven
- Product queries — Payload ORM is appropriate for product data which involves deep relations and draft/publish states
- Query caching — can be added with `React.cache()` + `unstable_cache` once load warrants it

---

## Testing Plan

1. Start dev server, navigate to `/search` — search for a known product title, verify results appear
2. Navigate to `/contact`, submit the form, verify success state renders
3. Check Payload admin → Form Submissions collection to confirm the submission record was created with correct field values
4. Submit with an invalid/missing formId scenario to confirm error state renders without exposing DB errors
