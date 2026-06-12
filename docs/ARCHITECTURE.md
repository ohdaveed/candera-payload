# Candera Architecture

Candera is a botanical candle storefront built on **Payload CMS** (headless backend + admin) and **Next.js App Router** (server-rendered storefront), with a deep **Etsy sync engine**, AI-assisted product copy, and email/archival integrations.

- **Database:** Vercel Postgres (Neon) via `@payloadcms/db-vercel-postgres`
- **Media storage:** Vercel Blob
- **Editor:** Lexical rich text
- **External services:** Etsy API v3, Anthropic (Claude), Mailchimp, Supabase

---

## 1. System Overview

How the major pieces connect — visitors, the Next.js app, Payload CMS, the datastore, and external services.

```mermaid
flowchart TB
    subgraph Client["🌐 Browser"]
        Visitor["Storefront Visitor"]
        Editor["Admin / Editor"]
    end

    subgraph Next["Next.js App Router (src/app)"]
        Frontend["(frontend)<br/>RSC storefront pages"]
        AdminUI["(payload)/admin<br/>Payload admin panel"]
        API["(payload)/api<br/>REST + GraphQL"]
        Actions["actions/<br/>Server Actions"]
        AIRoute["next/ai<br/>generate-product-copy"]
    end

    subgraph Payload["Payload CMS Core (payload.config.ts)"]
        Collections["Collections<br/>Pages · Posts · Products · Media<br/>Categories · ScentProfiles · Quizzes<br/>Users · EtsyTokens · Briefs"]
        Globals["Globals<br/>Header · Footer"]
        Plugins["Plugins<br/>SEO · Search · Redirects<br/>Form Builder · Nested Docs"]
        Hooks["Hooks<br/>revalidation · form submissions"]
    end

    subgraph Data["Datastore"]
        PG[("Vercel Postgres<br/>(Neon)")]
        Blob[("Vercel Blob<br/>media files")]
    end

    subgraph Ext["External Services"]
        Etsy["Etsy API v3"]
        Anthropic["Anthropic / Claude"]
        Mailchimp["Mailchimp"]
        Supabase["Supabase"]
    end

    Visitor --> Frontend
    Editor --> AdminUI
    Frontend -->|getPayload / cached queries| Collections
    Frontend -->|reads Header/Footer| Globals
    AdminUI --> Collections
    AdminUI --> Globals
    API --> Collections
    Actions -->|raw SQL insert| PG
    AIRoute -->|generateObject| Anthropic

    Collections <--> PG
    Collections <-->|uploads| Blob
    Globals <--> PG

    Hooks -->|revalidatePath / revalidateTag| Frontend
    Hooks --> Mailchimp
    Hooks --> Supabase

    Etsy -->|sync engine| Collections
```

---

## 2. Storefront Request & Rendering Flow

Pages are React Server Components. Data is fetched from Payload with `React.cache()` + tag-based caching, and the layout is assembled from a block array.

```mermaid
flowchart TB
    Req["Request /[slug], /posts/[slug], /products/[slug]"]
    Draft{"draftMode()<br/>enabled?"}
    Query["getPayload().find()<br/>cached query helper"]
    DocPub["Published doc"]
    DocDraft["Draft doc + LivePreviewListener"]
    Hero["Render Hero<br/>(High/Medium/Low impact)"]
    Blocks["RenderBlocks(layout[])"]

    Req --> Draft
    Draft -->|no| Query --> DocPub
    Draft -->|yes| Query2["find({ draft: true })"] --> DocDraft
    DocPub --> Hero
    DocDraft --> Hero
    Hero --> Blocks

    subgraph BlockTypes["Block components (src/blocks)"]
        SH["StorefrontHero"]
        SQ["ScentQuiz (client)"]
        FB["Form (client)"]
        IC["InnerCircleCTA"]
        CT["Content / CTA / Media"]
        AR["ArchiveBlock"]
        TS["Testimonials"]
        RP["RelatedPosts"]
    end

    Blocks --> BlockTypes
```

**Key route map (`src/app/(frontend)`):**

| Route | Purpose |
|---|---|
| `/[slug]` | CMS pages (home = `home`), block-driven layout |
| `/posts` · `/posts/[slug]` | Blog archive + post detail |
| `/products` · `/products/[slug]` | Product archive (filter/sort/paginate) + detail |
| `/contact` | Contact form → `submitForm` server action |
| `/inner-circle` | Email signup |
| `/search` | Full-text search over posts |
| `/(sitemaps)` | XML sitemaps |

---

## 3. Etsy Sync Engine

`src/utilities/syncEtsy.ts` uses a port–adapter design: domain logic is decoupled from the Etsy client, the product store, and media storage. Listings are validated with Zod, cleaned, converted to Lexical, and upserted transactionally.

```mermaid
flowchart LR
    Trigger["scripts/sync-etsy.ts<br/>or /sync-etsy endpoint"]
    Client["EtsyClient<br/>(OAuth 2.0)"]
    Tokens[("EtsyTokens<br/>collection")]
    Engine["EtsySyncEngine.sync()"]
    Zod{"Zod validation<br/>title contains 'candle'?"}
    Clean["Clean description<br/>→ Lexical rich text<br/>→ slug from title+id"]
    Img["Download main image"]

    Trigger --> Client
    Client <-->|refresh tokens| Tokens
    Client -->|getShopListings / batch| Engine
    Engine --> Zod
    Zod -->|reject| Skip["Skip listing"]
    Zod -->|accept| Clean --> Img

    Img -->|MediaStorageAdapter| Blob[("Vercel Blob")]
    Img -->|etsyImageId dedupe| Media[("media collection")]
    Clean -->|ProductStoreAdapter<br/>upsert in transaction| Products[("products collection")]
```

External Etsy API: `ETSY_API_KEY`, `ETSY_SHARED_SECRET`, `ETSY_REDIRECT_URI`. OAuth flow handled at `/etsy/oauth/*`; vacation mode via `/etsy/set-vacation`.

---

## 4. Forms, AI & Revalidation

Three event-driven flows that fan out from content/form changes.

```mermaid
flowchart TB
    subgraph FormFlow["Form Submission"]
        CF["ContactForm / Form block"] --> SA["submitForm (server action)<br/>raw SQL via Neon"]
        SA --> FST[("form_submissions table<br/>⚠ bypasses Payload hooks")]
        PW["Payload API write<br/>(admin / Local API)"] --> Hook["processSubmission<br/>afterChange hook"]
        Hook -->|Promise.allSettled| MC["Mailchimp<br/>upsert subscriber + tags"]
        Hook --> SB["Supabase<br/>archive submission"]
    end

    subgraph AIFlow["AI Product Copy"]
        AdminCopy["Admin: generate copy"] --> AIEP["next/ai/generate-product-copy<br/>(JWT-auth)"]
        AIEP -->|generateObject + Zod| Claude["Claude Haiku 4.5"]
        Claude --> Out["tagline · metaTitle · metaDescription"]
    end

    subgraph Reval["Cache Revalidation"]
        Change["Pages/Posts/Products<br/>afterChange / afterDelete"] --> RV["FlexibleRevalidator"]
        RV --> RP["revalidatePath('/{slug}')"]
        RV --> RT["revalidateTag(...)"]
    end
```

**Note:** the storefront `submitForm` server action writes directly to `form_submissions` via raw SQL, so it bypasses Payload's collection hooks — the `processSubmission` `afterChange` hook (and its Mailchimp/Supabase fan-out) only runs for submissions created through Payload's API (e.g. the admin panel or Local API).

**Search:** the Search plugin indexes published posts into a `search` collection via `beforeSyncWithSearch` (`src/search/beforeSync.ts`); `src/lib/queries/search.ts` runs ILIKE queries against it through the Neon SQL client.

---

## 5. Core Data Model

Relationships between the main collections.

```mermaid
erDiagram
    USERS ||--o{ POSTS : authors
    POSTS }o--o{ CATEGORIES : categories
    POSTS }o--o{ POSTS : relatedPosts
    POSTS }o--|| MEDIA : heroImage
    PRODUCTS }o--o{ CATEGORIES : categories
    PRODUCTS }o--|| SCENTPROFILES : atmosphere
    PRODUCTS }o--o{ MEDIA : extraPhotos
    SCENTPROFILES }o--|| PRODUCTS : featuredProduct
    QUIZZES ||--o{ QUESTIONS : has
    QUESTIONS ||--o{ OPTIONS : has
    OPTIONS }o--|| MEDIA : image
    OPTIONS }o--o{ SCENTPROFILES : scores
    HEADER ||--o{ NAVITEMS : navItems
    FOOTER ||--o{ NAVITEMS : navItems
```

The **ScentQuiz** ties it together: quiz options carry weighted scores toward ScentProfiles, and each ScentProfile maps to a featured Product — turning a quiz result into a product recommendation.
