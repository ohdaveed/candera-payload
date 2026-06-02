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
