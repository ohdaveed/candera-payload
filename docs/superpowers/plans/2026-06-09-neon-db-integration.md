# Neon DB Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up `@neondatabase/serverless` for direct DB queries — a shared client, an enhanced search query, and a Server Action for form submissions — replacing the current Payload ORM and REST API calls for these two specific paths.

**Architecture:** A single `src/lib/db.ts` exports the `neon()` SQL client. A query module (`src/lib/queries/search.ts`) handles search reads directly against `public.search` + `public.media`. A Server Action (`src/app/actions/submitForm.ts`) writes form submissions directly to `public.form_submissions` and `public.form_submissions_submission_data`. The search page and ContactForm are updated to use these instead of `payload.find()` and `fetch('/api/form-submissions')`.

**Tech Stack:** `@neondatabase/serverless ^1.1.0`, Next.js App Router Server Components + Server Actions, TypeScript, Vitest (`vite-plus/test`)

---

## File Map

| Action | File |
|--------|------|
| **Create** | `src/lib/db.ts` |
| **Create** | `src/lib/queries/search.ts` |
| **Create** | `src/app/actions/submitForm.ts` |
| **Create** | `tests/int/lib/search.int.spec.ts` |
| **Create** | `tests/int/submitForm.int.spec.ts` |
| **Modify** | `src/app/(frontend)/search/page.tsx` |
| **Modify** | `src/components/ContactForm/index.tsx` |
| **Modify** | `src/app/(frontend)/contact/page.tsx` |

---

## Task 1: Neon Client Foundation

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create the client file**

```ts
// src/lib/db.ts
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
cd /home/ohdaveed/projects/candera-payload && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors related to `src/lib/db.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add Neon serverless client at src/lib/db"
```

---

## Task 2: Search Query Module

**Files:**
- Create: `src/lib/queries/search.ts`
- Create: `tests/int/lib/search.int.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/lib/search.int.spec.ts
import { describe, it, expect } from 'vite-plus/test'
import { searchContent } from '@/lib/queries/search'

describe('searchContent', () => {
  it('returns empty array immediately for blank query without hitting DB', async () => {
    const result = await searchContent('')
    expect(result).toEqual([])
  })

  it('returns empty array for whitespace-only query', async () => {
    const result = await searchContent('   ')
    expect(result).toEqual([])
  })

  it('returns an array for a non-empty query', async () => {
    // This hits the real DB — verifies the query runs without error
    const result = await searchContent('candle')
    expect(Array.isArray(result)).toBe(true)
  })

  it('result items have the expected shape', async () => {
    const results = await searchContent('candle')
    if (results.length > 0) {
      const item = results[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('slug')
    }
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm test:int 2>&1 | grep -A5 "searchContent"
```

Expected: `Cannot find module '@/lib/queries/search'`

- [ ] **Step 3: Create the query module**

```ts
// src/lib/queries/search.ts
import { sql } from '@/lib/db'

export type SearchResult = {
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

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const pattern = `%${query.trim()}%`

  const rows = await sql`
    SELECT
      s.id,
      s.title,
      s.slug,
      s.meta_title,
      s.meta_description,
      m.url   AS meta_image_url,
      m.alt   AS meta_image_alt,
      m.width AS meta_image_width,
      m.height AS meta_image_height
    FROM   search s
    LEFT JOIN media m ON s.meta_image_id = m.id
    WHERE  s.title            ILIKE ${pattern}
        OR s.meta_description ILIKE ${pattern}
        OR s.meta_title       ILIKE ${pattern}
        OR s.slug             ILIKE ${pattern}
    ORDER  BY s.priority DESC NULLS LAST, s.created_at DESC
    LIMIT  12
  `

  return rows as SearchResult[]
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm test:int 2>&1 | grep -A10 "searchContent"
```

Expected: all 4 tests pass. The DB-hitting tests may be skipped or pass depending on whether `DATABASE_URL` is set in the test environment — the empty-query tests must always pass.

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/ohdaveed/projects/candera-payload && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/search.ts tests/int/lib/search.int.spec.ts
git commit -m "feat: add searchContent Neon query with media join"
```

---

## Task 3: Update Search Page

**Files:**
- Modify: `src/app/(frontend)/search/page.tsx`

The current page calls `payload.find({ collection: 'search', ... })`. Replace it with `searchContent()` and map results to `CardPostData`.

- [ ] **Step 1: Replace the page with the Neon-backed version**

Open `src/app/(frontend)/search/page.tsx` and replace the entire file with:

```tsx
import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'
import type { Media } from '@/payload-types'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { searchContent } from '@/lib/queries/search'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  const results = await searchContent(query ?? '')

  const posts: CardPostData[] = results.map((r) => ({
    title: r.title ?? undefined,
    slug: r.slug ?? undefined,
    categories: undefined,
    meta: {
      title: r.meta_title ?? undefined,
      description: r.meta_description ?? undefined,
      image: r.meta_image_url
        ? ({
            url: r.meta_image_url,
            alt: r.meta_image_alt ?? '',
            width: r.meta_image_width ?? 0,
            height: r.meta_image_height ?? 0,
          } as Media)
        : undefined,
    },
  }))

  return (
    <div className="min-h-screen bg-candera-vellum">
      <PageClient />

      <div className="container pt-32 pb-16">
        <PageHeader
          align="center"
          eyebrow="Explore"
          title="Search the Collection"
          description="Discover your next ritual scent."
          maxWidthClassName="max-w-[560px]"
          className="mb-20"
        >
          <Search />
        </PageHeader>
      </div>

      {posts.length > 0 ? (
        <CollectionArchive posts={posts} />
      ) : query ? (
        <div className="container pb-32 text-center">
          <p className="editorial text-[24px] italic text-candera-sage-text mb-8">
            Nothing found for &ldquo;{query}&rdquo;
          </p>
          <Link
            href="/products"
            className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
          >
            ← Return to the Collection
          </Link>
        </div>
      ) : (
        <div className="container pb-32 text-center">
          <Link
            href="/products"
            className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
          >
            Explore the full collection →
          </Link>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search — Candera`,
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/ohdaveed/projects/candera-payload && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/search/page.tsx"
git commit -m "feat: replace payload.find search with direct Neon query"
```

---

## Task 4: Form Submission Server Action

**Files:**
- Create: `src/app/actions/submitForm.ts`
- Create: `tests/int/submitForm.int.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/submitForm.int.spec.ts
import { describe, it, expect } from 'vite-plus/test'
import { submitForm } from '@/app/actions/submitForm'

describe('submitForm', () => {
  it('returns error for invalid formId (0)', async () => {
    const result = await submitForm(0, [{ field: 'email', value: 'test@test.com' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid form.')
    }
  })

  it('returns error for negative formId', async () => {
    const result = await submitForm(-1, [{ field: 'email', value: 'test@test.com' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid form.')
    }
  })

  it('returns error for empty submissionData', async () => {
    const result = await submitForm(1, [])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('No submission data.')
    }
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm test:int 2>&1 | grep -A5 "submitForm"
```

Expected: `Cannot find module '@/app/actions/submitForm'`

- [ ] **Step 3: Create the Server Action**

```ts
// src/app/actions/submitForm.ts
'use server'

import { sql } from '@/lib/db'

type SubmitFormResult = { ok: true } | { ok: false; error: string }

export async function submitForm(
  formId: number,
  submissionData: { field: string; value: string }[],
): Promise<SubmitFormResult> {
  if (!Number.isInteger(formId) || formId <= 0) {
    return { ok: false, error: 'Invalid form.' }
  }

  if (!submissionData.length) {
    return { ok: false, error: 'No submission data.' }
  }

  try {
    const rows = await sql`
      INSERT INTO form_submissions (form_id, updated_at, created_at)
      VALUES (${formId}, NOW(), NOW())
      RETURNING id
    `

    const submissionId = (rows[0] as { id: number }).id

    await sql.transaction((tx) =>
      submissionData.map((item, i) =>
        tx`
          INSERT INTO form_submissions_submission_data
            (_order, _parent_id, id, field, value)
          VALUES (${i}, ${submissionId}, ${crypto.randomUUID()}, ${item.field}, ${item.value})
        `,
      ),
    )

    return { ok: true }
  } catch {
    return { ok: false, error: 'Something went wrong.' }
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm test:int 2>&1 | grep -A10 "submitForm"
```

Expected: all 3 validation tests pass (no DB connection needed for these).

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/ohdaveed/projects/candera-payload && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/submitForm.ts tests/int/submitForm.int.spec.ts
git commit -m "feat: add submitForm Server Action with direct Neon writes"
```

---

## Task 5: Wire ContactForm to Server Action

**Files:**
- Modify: `src/components/ContactForm/index.tsx`
- Modify: `src/app/(frontend)/contact/page.tsx`

- [ ] **Step 1: Update ContactForm**

Replace the entire file `src/components/ContactForm/index.tsx` with:

```tsx
'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Section } from '@/components/ui/section'
import { submitForm } from '@/app/actions/submitForm'

type FormValues = {
  'full-name': string
  email: string
  phone?: string
  message: string
}

type Props = {
  formId: number
}

export const ContactForm: React.FC<Props> = ({ formId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const form = useForm<FormValues>({
    defaultValues: {
      'full-name': '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = useCallback(
    (data: FormValues) => {
      const submit = async () => {
        setError(undefined)
        setIsLoading(true)

        const result = await submitForm(formId, [
          { field: 'full-name', value: data['full-name'] },
          { field: 'email', value: data.email },
          { field: 'phone', value: data.phone || '' },
          { field: 'message', value: data.message },
        ])

        setIsLoading(false)

        if (!result.ok) {
          setError(result.error)
          return
        }

        setHasSubmitted(true)
      }

      void submit()
    },
    [formId],
  )

  if (hasSubmitted) {
    return (
      <Section padding="none" className="py-12 text-center">
        <p className="font-display text-2xl text-candera-obsidian mb-3 italic">
          Your note has been received.
        </p>
        <p className="font-sans text-sm text-candera-sage-text">
          We respond with intention — expect a reply within 48 hours.
        </p>
      </Section>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <Section
            padding="none"
            className="mb-6 p-4 bg-candera-rose/10 text-candera-rose text-[13px] font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </Section>
        )}

        <Section padding="none" className="flex flex-col gap-6">
          <FormField
            control={control}
            name="full-name"
            rules={{ required: 'Full name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Full Name{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Email{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Phone{' '}
                  <span className="text-candera-stone/60 text-[10px] normal-case tracking-normal font-normal ml-1">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="(555) 000-0000" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="message"
            rules={{ required: 'Message is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Message{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="How can we help?" rows={5} {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />
        </Section>

        <Section padding="none" className="mt-8">
          <Button type="submit" variant="cta-ember" size="cta" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Correspondence'}
          </Button>
        </Section>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Update contact page — remove `.toString()` cast**

In `src/app/(frontend)/contact/page.tsx`, find and update the `contactFormId` line:

```tsx
// Before:
const contactFormId = formsResult.docs[0]?.id?.toString() ?? ''

// After:
const contactFormId = formsResult.docs[0]?.id ?? 0
```

And update the JSX prop — confirm `<ContactForm formId={contactFormId} />` still compiles (the type is now `number`, which matches).

- [ ] **Step 3: Verify TypeScript**

```bash
cd /home/ohdaveed/projects/candera-payload && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Run the full test suite**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm test:int 2>&1 | tail -20
```

Expected: all tests pass (including the new search and submitForm tests from Tasks 2 and 4).

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactForm/index.tsx "src/app/(frontend)/contact/page.tsx"
git commit -m "feat: wire ContactForm to submitForm Server Action"
```

---

## Task 6: Manual Verification

- [ ] **Step 1: Start the dev server**

```bash
cd /home/ohdaveed/projects/candera-payload && pnpm dev
```

- [ ] **Step 2: Verify search**

Navigate to `http://localhost:3000/search`. Type a known term (e.g. "amber", "cedar", or any product title from the seeded data). Confirm results appear and cards render correctly.

Test the empty state: search for "xyznotfound123" — should show "Nothing found" state.

- [ ] **Step 3: Verify contact form submission**

Navigate to `http://localhost:3000/contact`. Fill in all fields and submit. Confirm:
- Success state renders ("Your note has been received.")
- In Payload admin at `/admin/collections/form-submissions`, a new record appears with the correct field values

- [ ] **Step 4: Verify error state**

Temporarily break the DB URL to confirm the error state renders ("Something went wrong.") without exposing DB internals. Restore after.

- [ ] **Step 5: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore: post-verification cleanup"
```
