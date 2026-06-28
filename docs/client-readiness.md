# Candera — Client Readiness Report

**Date:** 2026-06-23
**Stack:** Payload CMS 3.85 · Next.js 16 (App Router) · React 19 · Vercel (Neon Postgres + Blob) · Etsy sync · AI copy via Vercel AI Gateway (Claude Haiku 4.5)

This report captures a pre-handoff evaluation of the Candera storefront and what
was remediated in the accompanying PR. It also lists the items that require the
**client/studio** to act before launch.

---

## Verdict

The build is high quality and close to shippable. Most findings in this PR were
fixed in code. **Two items remain hard launch blockers that only the client can
close:** (1) rotating the leaked database credential + purging it from git
history, and (2) finalizing the legal/privacy page content. Tracked GitHub issues
exist for both.

---

## Fixed in this PR

### Security & access
- **Seed route is now admin-only.** `POST /next/seed` (destructive — wipes and
  rewrites every collection) previously accepted any authenticated editor. It now
  requires the `admin` role via a new `userIsAdmin` helper
  (`src/access/isAdmin.ts`).
- **Server-side form-submission caps.** A `beforeValidate` hook
  (`src/hooks/formSubmissions/validateSubmission.ts`) enforces ≤50 fields and
  ≤5000 chars/value, strips empty field names, and coerces values — covering both
  the `submitForm` server action and direct `POST /api/form-submissions`. The
  same caps are mirrored in `submitForm.ts` for early rejection.
- **Real `SECURITY.md`** replacing the unedited GitHub template (confirm the
  `security@canderacandles.com` contact).
- **Removed committed design scratch** (`.superdesign/` HTML/CSS) and added it to
  `.gitignore`.

### Etsy integration hardening
- **`ETSY_SHOP_ID` is now required** — the endpoints throw instead of silently
  defaulting to the original developer's shop id.
- **Per-request timeouts** (15s API, 20s image download) so a hung Etsy/CDN
  response can't stall the serial sync until the platform kills the function.
- **`x-api-key` sends `keystring:shared_secret`, by Etsy mandate — do not "fix"
  this to keystring-only.** Etsy Open API v3 requires this exact header on every
  request: `x-api-key: <keystring>:<shared_secret>`. The shared secret here is part
  of the required _application_ credential, **not** a confidential OAuth client
  secret (under our PKCE flow it is never used in token exchange), so it is sent by
  design and is **not** a leak — omitting it makes the keystring invalid and Etsy
  rejects the request. This has tripped automated "secret in header" scanners twice;
  both were false positives. PR #123 removed it and broke auth; #124 restored it.
  Ref: <https://developer.etsy.com/documentation/essentials/authentication/>
- **Auth degradation is now logged** when OAuth token refresh fails (previously
  silently dropped the Authorization header).

### AI route reliability
- The "generate product copy" route now wraps the model call in try/catch, logs
  failures via `payload.logger`, and returns a clean `502` instead of an opaque
  unhandled 500.

### Frontend / UX
- Out-of-range pagination (`/products/page/999`, posts equivalent) now returns
  404 instead of an empty grid.
- How-To listing has an empty state; listing/pagination routes gained
  `description` + Open Graph metadata.
- On-brand 404 page; added a root `global-error.tsx` boundary; footer legal links
  gained focus-visible rings.

### Legal pages (partial — see client action items)
- Replaced "Content coming soon." with **clearly-marked DRAFT boilerplate** for
  Privacy, Terms, Shipping & Returns, and Wholesale, so email-capture consent no
  longer links to an empty page. **This is placeholder content pending legal
  review — not final copy.**

### CI, dependencies, config
- **CI workflow** running lint → migrate → integration tests → build on a
  Postgres service container (previously only a Trivy scan ran). The workflow
  YAML could not be pushed by this automation (OAuth lacks `workflow` scope) — it
  is provided verbatim in the tracking issue for a maintainer to commit.
- **Dependency CVEs:** added `pnpm-workspace.yaml` overrides bumping vulnerable
  transitive `undici` and `nodemailer` to patched releases. `pnpm audit --prod`
  dropped from **13 findings (5 high) → 1 low** (an esbuild dev-server-only,
  Windows-only advisory that does not affect production).
- **Wired the database-adapter selector** (`utilities/databaseAdapter.ts`, prev.
  dead code) into `payload.config.ts`: a `*.neon.tech` host (production) keeps the
  Vercel serverless adapter; any other host (local/CI) uses the standard Postgres
  adapter. This makes the same config run in CI and closes a dead-code finding.
  **Production behavior is unchanged** (it connects to a Neon host).
- Removed the throwaway `scripts/reset-password.ts` (hardcoded user id).
- Documented the **Vercel AI Gateway** credential and the now-required
  `ETSY_SHOP_ID` / `DATABASE_URI` in `.env.example`.

### Verification performed
- `pnpm lint` — clean (2 pre-existing ScentQuiz a11y warnings only).
- `npx tsc --noEmit` — **0 errors in `src/`**.
- `pnpm payload migrate` — all migrations apply against fresh Postgres 16.
- `pnpm build` — production build + sitemap generation succeed.
- `pnpm audit --prod` — 1 low (down from 13).
- _Integration tests:_ not run in this environment due to a `vitest` binary
  resolution quirk in the `vite-plus` toolchain; CI runs them on a Postgres
  service container.

---

## Client action items (required before launch)

| # | Item | Why it needs you |
|---|------|------------------|
| 1 | **Rotate the Neon database password and purge `.env.ci` from git history.** A live credential (`neondb_owner` password) is recoverable from history at commit `e3d52ba`. | Requires rotating the secret in Neon and force-rewriting shared history (BFG/`git filter-repo`) — destructive, must be authorized by the repo owner. Tracked: issue #1. |
| 2 | **Finalize legal/privacy page content.** | The DRAFT boilerplate is generic and non-binding; real copy must be authored/reviewed by counsel. Tracked: issue #4. |
| 3 | **Provision bot mitigation for public forms** (CAPTCHA/Turnstile + rate limiting via Upstash or edge middleware). | Needs infrastructure/accounts you own; the code-level caps shipped here are not a substitute. Tracked: issue #2. |
| 4 | **Review residual dependency advisories** and keep `pnpm audit` clean over time. | Tracked: issue #3. |
| 5 | **Commit the CI workflow** (`.github/workflows/ci.yml`, provided in the tracking issue) with an account that has `workflow` scope. | This automation's OAuth token cannot create workflow files. |
| 6 | **Confirm Node 24** in the deploy + local environments (`engines: node 24.x`). | Mismatch can cause subtle runtime differences. |
| 6 | **Confirm ownership of all runtime external services** (below). | Each needs the studio's own credentials. |

### Runtime external services (the studio must own credentials for)
- **PostgreSQL (Neon / Vercel Postgres)** — `DATABASE_URI` (source of truth) / `POSTGRES_URL`
- **Vercel Blob** — `BLOB_READ_WRITE_TOKEN` (hard-required in production)
- **Vercel AI Gateway** — for the AI copy route (Claude Haiku 4.5)
- **Etsy OAuth app** — `ETSY_API_KEY`, `ETSY_SHARED_SECRET`, `ETSY_REDIRECT_URI`, `ETSY_SHOP_ID`
- **FormSubmit.co** — `FORMSUBMIT_EMAIL` (third-party email relay)
- **SMTP (optional)** — Payload transactional email; silently no-ops to `jsonTransport` if unset
- **Core** — `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL`

### Known residual (low priority)
- SMTP falls back to a no-op `jsonTransport` with no warning when `SMTP_HOST` is
  unset — password-reset emails silently vanish. Consider a startup warning.
- `@inferencesh/sdk` is a declared dependency with no imports under `src/` — can
  be removed.
- Etsy OAuth `state` is generated but not validated on callback (CSRF hardening).
