# Candera: Botanical Scent Studio

Candera is a digital storefront and micro-batch artisan platform for hand-poured botanical candles. This project is a headless architecture integrating **Payload CMS 3** with a **Next.js 15+** storefront, featuring a custom synchronization engine for Etsy inventory.

## Project Overview

- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, Framer Motion.
- **CMS:** Payload CMS v3 (Node.js).
- **Database:** Postgres (Neon/Vercel Postgres).
- **Storage:** Vercel Blob Storage for media.
- **Core Mission:** Bridging artisan craft with high-performance digital experience.

## Technical Architecture

### 1. Etsy Synchronization Engine

Located in `src/utilities/syncEtsy.ts`, this engine uses a Hexagonal Architecture (Ports & Adapters) to ingest and validate Etsy listings.

- **Validation:** listings must contain 'candle' in the title (enforced via Zod).
- **Mapping:** Etsy listing IDs are mapped to Payload `Products` collection; images are mapped to `Media`.

### 2. Payload CMS Configuration

- **Collections:**
  - `Products`: Core commerce entity (candle, vintage, custom types). Includes scent profiles and atmospheric relationships.
  - `Media`: Integrated with Vercel Blob and Etsy Image IDs.
  - `Pages` / `Posts`: Content management with a block-based builder.
  - `ScentProfiles` / `Quizzes`: Domain-specific botanical data.
- **Global Config:** `Header` and `Footer` managed as Payload Globals.

### 3. Frontend Architecture

- **Component Library:** Uses Radix UI primitives and custom botanical-themed components.
- **Page Builder:** `src/blocks/RenderBlocks.tsx` maps CMS blocks (Archive, CTA, Content, Media, StorefrontHero, ScentQuiz, etc.) to React components.
- **Fonts:** Fraunces (serif), DM Sans (sans), EB Garamond (serif), Geist Mono.

## Key Commands

| Command                   | Description                                                          |
| :------------------------ | :------------------------------------------------------------------- |
| `pnpm dev`                | Starts the Next.js development server.                               |
| `pnpm ci`                 | Runs migrations and builds the project for production.               |
| `pnpm generate:types`     | Regenerates Payload TypeScript definitions (`src/payload-types.ts`). |
| `pnpm lint`               | Runs the custom linting suite (`vp lint`).                           |
| `pnpm test`               | Runs all tests (Vitest for integration, Playwright for E2E).         |
| `pnpm test:int`           | Runs Vitest integration tests.                                       |
| `pnpm test:e2e`           | Runs Playwright E2E tests.                                           |
| `scripts/local-build.sh`  | Reproduces the CI/Vercel build locally.                              |
| `pnpm dump-public-schema` | Dumps the database schema for tracking.                              |

## Development Conventions

- **File Organization:**
  - `src/app/(frontend)`: Storefront routes and components.
  - `src/collections`: Payload collection definitions.
  - `src/blocks`: Page builder block components.
  - `src/utilities`: Shared logic and helper functions.
  - `scripts/`: Utility scripts for seeding and database management.
- **Styling:** Tailwind CSS v4 is used with a CSS-variable-driven theme (`src/app/(frontend)/globals.css`).
- **Testing:** New features should include Vitest integration tests in `tests/int` or Playwright E2E tests in `tests/e2e`.
- **Deployment:** Optimized for Vercel. Use `scripts/local-build.sh` to verify changes before pushing to `main`.
- **Etsy Sync:** To trigger a sync manually, use the `/api/sync-etsy` endpoint (authenticated) or run the `sync-etsy` task if configured.

## Directory Structure Highlights

- `src/access/`: Security and access control logic for CMS collections.
- `src/heros/`: Reusable hero components (High Impact, Medium Impact, etc.).
- `src/providers/`: Context providers (Theme, Auth, etc.).
- `data/`: Static data or seed payloads.
- `schema/`: Database schema dumps.
