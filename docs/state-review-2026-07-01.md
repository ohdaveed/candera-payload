# App State Review — 2026-07-01

Snapshot review of `main` (`e7ef64e`) plus verification that the current tree
installs, builds, and tests clean. No source changes were made for this review;
this file is the only artifact.

## Verification performed

Run against a **local Postgres 16** (the sandbox's provided Neon `DATABASE_URL`
credential failed auth and raw TCP was blocked, so it was not representative):

| Step | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | ✅ exit 0 |
| Migrate | `pnpm payload migrate` | ✅ `20260629_204245_initial` applied, 108 tables |
| Build | `pnpm build` (`next build` + `next-sitemap`) | ✅ Next.js 16 build w/ Partial Prerendering |
| Tests | `pnpm test:int` (`vp test run`, 18 int spec files) | ✅ 82/82 |

Takeaway: the recent **Next.js 16 upgrade** (cache components, server-boundary
hardening, build-time DB bail fixes) builds and tests cleanly on a properly
provisioned environment.

## Open items (none blocking)

### 1. `payload-generated-schema.ts` is drifted (minor, dev-only)
Lines ~302–306 and ~767–771 still declare seeded defaults that no longer match
the config / active migration:

```ts
statusCardTitle:    varchar('status_card_title').default('Featured Candle'),
statusCardSubtitle: varchar('status_card_subtitle').default('Wild Lilac (8 oz)'),
statusCardStatus:   varchar('status_card_status').default('Limited Batch'),
statusCardShips:    varchar('status_card_ships').default('47 units total'),  // config/migration have NO default here
```

Production (migrate-based, `push: false`) is unaffected — the
`20260629_204245_initial` migration defines `status_card_ships` as plain
`varchar` with no default. This file only bites `push`-based dev / drizzle
tooling. Fix: regenerate with `pnpm payload generate:db-schema` and commit.

### 2. Legacy hidden hero fields carry placeholder defaults (low)
`statusCardTitle / statusCardPrice / statusCardSubtitle / statusCardStatus /
statusCardShips / statusCardLinkUrl` in `src/blocks/StorefrontHero/config.ts`
are `admin: { hidden: true }` and are no longer rendered (the hero now uses the
Maker Ethos card). All but `statusCardShips` still carry seeded defaults
(`'Featured Candle'`, `'$38'`, `'Wild Lilac (8 oz)'`, `'Limited Batch'`,
`'/products/wild-lilac'`).
Harmless dead data — the earlier "47 units total" honesty concern is resolved
since these are unrendered — but prunable if you want the schema clean. If
removed, pair with a migration to drop the columns.

### 3. Next.js 16 upgrade recency (watch)
Verified green here, but it's a broad, recent framework migration. Worth a
smoke test on a real preview deploy for runtime behavior, bundle size, and
cache-tag revalidation that a static build can't confirm.

## Notes
- CI health is good: `types-check`, `migration-drift`, and `security` workflows;
  ~3 tech-debt markers across `src`; solid integration suite + Playwright e2e.
- To reproduce locally: `pass-cli run --env-file .env -- pnpm build` and
  `pass-cli run --env-file .env -- pnpm test:int` (the suite verified here) with a
  real DB + Etsy/email vars. `pnpm test` additionally runs the Playwright e2e
  suite, which was not exercised in this review.
