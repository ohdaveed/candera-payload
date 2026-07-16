# Candera: Botanical Scent Studio

Candera is a digital storefront and micro-batch artisan platform dedicated to intentional living. We craft hand-poured botanical candles in numbered batches, merging traditional craft with a modern, high-performance web experience.

This repository powers the Candera ecosystem, featuring a deep [Etsy-to-Payload](#etsy-integration) synchronization engine and a beautifully designed, high-conversion Next.js storefront.

## The Ritual

Candera is more than a candle shop; it's an invitation to slow down. Our platform is built to reflect the stillness of the studio:

- **Micro-Batch Depth:** Focused on small, intentional collections.
- **Botanical Clarity:** Scent profiles derived from real pressed botanicals.
- **Studio Status:** Integrated tracking shows the current state of the collection—pouring, curing, or ready for ritual.

---

## Technical Architecture

Built on [Payload CMS](https://payloadcms.com) and [Next.js](https://nextjs.org), this project utilizes a headless architecture to manage commerce and content with extreme precision.

### Etsy Integration

At the heart of Candera is a custom synchronization engine (`src/utilities/syncEtsy.ts`) that bridges our Etsy inventory with our local Payload database.

- **Automated Ingestion:** Fetches active listings, media, and metadata from the Etsy API.
- **Zod Validation:** Strictly filters incoming data to ensure only botanical products enter the collection.
- **Transactional Upserts:** Ensures data integrity between Etsy and the local storefront.

### Core Features

- **Next.js App Router:** High-performance, server-side rendered storefront.
- **Live Preview:** Real-time editing of pages and product descriptions.
- **On-demand Revalidation:** Instant frontend updates when content or batches change.
- **Responsive Rituals:** Optimized for high-precision touch targets (Fitts's Law) and seamless navigation.

---

## Local Development

To spin up the Candera studio locally, follow these steps:

### Prerequisites

- Node.js (>=24.15.0)
- pnpm

### Setup

1. `git clone` this repo.
2. `cp .env.example .env` and configure your `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN`.
   The committed `.env` convention uses `pass://` URIs (Proton Pass via `pass-cli`) instead of
   raw values — see `AGENTS.md` for the secret-injection flow. Never overwrite `.env` with
   plaintext secrets.
3. `pnpm install`, then `pass-cli run --env-file .env -- pnpm dev` (or plain `pnpm dev` if your
   `.env` contains resolved values).
4. Open `http://localhost:3000` to view the storefront.

### Database Seeding

To populate the studio with Batch 014 and our botanical archives:

- Access the admin panel at `/admin`.
- Navigate to the dashboard and select **Seed Database**.
- _Note: Seeding is destructive and will overwrite existing local data._

---

## Deploying to Vercel

Candera is optimized for Vercel, utilizing Neon (Postgres) and Vercel Blob Storage.

Production deploys are triggered from `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?build-command=pnpm%20run%20ci&env=PAYLOAD_SECRET%2CCRON_SECRET%2CPREVIEW_SECRET&project-name=candera-studio&repository-name=candera-payload)

## Local build helper

We've added a small helper script to reproduce the CI/Vercel build locally: `scripts/local-build.sh`.

- Make it executable: `chmod +x scripts/local-build.sh`
- Run with defaults (uses `pass-cli` with `.env` if available): `./scripts/local-build.sh`
- Common options: `--env-file`, `--skip-migrate`, `--skip-tests`, `--skip-lint`, `--build-only`

This script installs dependencies, runs migrations (if available), builds, lints, and can run tests to mirror CI locally.

## Questions?

Reach out to the studio team or join our ritual on Discord.
