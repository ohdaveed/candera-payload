# Tagline & SEO Generator — Design Spec

**Date:** 2026-06-07
**Status:** Approved

## Overview

An AI-powered "Generate All" button inside the Payload admin product edit form. Given the current product's data and a user-selected tone, it generates a tagline, SEO meta title, and SEO meta description in one shot, then lets the editor accept or discard each suggestion before saving.

## Architecture

Three self-contained pieces:

### 1. API Route
**Path:** `src/app/(frontend)/api/ai/generate-product-copy/route.ts`

- `POST` handler
- Input body: `{ title, productType, scentProfile, atmosphere, burnTime, tone }`
- Calls `generateObject` from `ai` with `anthropic/claude-haiku-4.5` via Vercel AI Gateway (OIDC auth via `VERCEL_OIDC_TOKEN`)
- Output schema (Zod):
  ```ts
  z.object({
    tagline: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
  })
  ```
- Returns JSON `{ tagline, metaTitle, metaDescription }`
- No Payload auth enforced — the route trusts that only admin users reach it. If the project adds public API exposure later, this route should add a session check via `getPayload` + `req.user`.

### 2. Custom Admin Component
**Path:** `src/components/admin/GenerateCopyButton.tsx`

- `'use client'` React component
- Reads live form values via Payload's `useFormFields`: `title`, `scentProfile.top`, `scentProfile.heart`, `scentProfile.base`, `atmosphere`, `burnTime`
- Writes accepted suggestions back via `useField` per field path: `tagline`, `meta.title`, `meta.description`
- Renders:
  - Tone selector: **Poetic** (default) / **Minimal** / **Bold**
  - "Generate All" button (disabled + tooltip if `title` is empty)
  - Spinner during request
  - Three-row comparison panel on success (one row per field)
  - Inline error message with retry on failure

### 3. Collection Config Change
**Path:** `src/collections/Products.ts`

- Adds a `ui` type field at the bottom of the fields array
- Mounts `GenerateCopyButton` as the field component
- No impact on the data schema

## Data Flow

1. User opens a product in Payload admin
2. `GenerateCopyButton` mounts; reads current form field values
3. User selects tone (Poetic pre-selected) and clicks "Generate All"
4. Component POSTs `{ title, productType, scentProfile, atmosphere, burnTime, tone }` to the API route
5. API route calls AI Gateway → returns `{ tagline, metaTitle, metaDescription }`
6. Component renders three-row comparison panel:
   - Each row: field label, current value (greyed or "— empty —"), suggestion (highlighted), "Accept" button
7. User clicks "Accept" on desired fields → `useField.setValue` writes to form
8. Accepted rows collapse; user can re-run with a different tone at any time
9. User saves the product via Payload's normal Save button

## Prompt System

### System prompts (per tone)

**Poetic:**
> You write copy for Candera, a luxury candle boutique. Your voice is evocative, sensory, and intimate — words like "ritual," "warmth," "atmosphere." Avoid generic adjectives.

**Minimal:**
> You write copy for Candera, a luxury candle boutique. Your voice is clean and direct. State the scent and mood simply. No flowery language.

**Bold:**
> You write copy for Candera, a luxury candle boutique. Your voice is confident and punchy. Lead with impact. Short sentences.

### User prompt (assembled from non-empty fields)

```
Product: {title} ({productType})
Scent profile: top — {top}, heart — {heart}, base — {base}
Atmosphere: {atmosphere}
Burn time: {burnTime}

Generate a tagline (max 12 words), SEO meta title (max 60 characters), and SEO meta description (max 155 characters).
```

Only non-empty fields are included. Sparse products still generate usable output.

Character limits are enforced via the prompt, not by truncating output — truncation mid-sentence produces bad copy.

## Error Handling

- `title` empty → button disabled, tooltip: "Add a title first"
- API failure → inline error message in the panel with a retry button
- No toast libraries; plain text error state

## What This Does Not Do

- Does not auto-save — the user always clicks Payload's Save button
- Does not overwrite without user confirmation — every suggestion requires explicit "Accept"
- Does not generate `description` (the rich text body field) — tagline + meta only
- Does not add new dependencies beyond `ai` (already installed)
