# Context

This document captures the core concepts and domain definitions for the Candera project.

## Etsy Integration

The mechanism for synchronizing active botanical candle listings, Alt descriptions, and media attachments from the Etsy shop platform to the local Payload database.

### Etsy Client
A deep module (`src/utilities/etsyClient.ts`) encapsulating the communication transport with Etsy's API. It abstracts away:
* Token storage details.
* Sliding-window OAuth 2.0 token refreshes (checked 5 minutes prior to expiration).
* Credentials signature header fallbacks (`x-api-key`).

### Token Repository
A seam (`TokenRepository` interface) representing the persistent store of OAuth tokens. It isolates database interactions from the client logic, allowing in-memory adapters during unit tests and local database adapters during production runs.

## Content Revalidation

The process of invalidating Next.js frontend cache tags and paths dynamically when Payload database collections (Pages, Posts) or Globals (Header, Footer, Redirects) are modified or deleted.

### Revalidation Engine
A deep module (`src/utilities/revalidate.ts`) that manages registry tables, rules, and trigger conditions. It shields database collections from knowing the technicalities of sitemaps, Next.js cache APIs, or tag list arrays.

### Cache Buster Port
A seam (`CacheBusterPort` interface) representing the invalidation client. It isolates the environment-dependent Next.js caching APIs (`revalidatePath`, `revalidateTag`), allowing mock implementations in tests.

## Etsy Product Synchronization

The workflow of fetching listings from Etsy's API, downloading media assets, parsing text descriptions into Lexical structures, and transactional upserts to the Payload database.

### Sync Engine
A deep, database-agnostic module (`src/utilities/syncEtsy.ts`) that coordinates the synchronization. It operates solely against abstract ports, ensuring the synchronization algorithm can be tested and verified in memory.

### Database Store Port
A seam (`ProductStorePort` interface) decoupling product inserts, checks, and transactions from Payload collections.

### Media Storage Port
A seam (`MediaStoragePort` interface) decoupling image streams, duplicate detection, and file registration from the media database and external fetch clients.
