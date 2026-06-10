# Unused Code Cleanup Plan

Analysis date: 2026-06-10
Project: `/home/ohdaveed/projects/candera-payload`

## Scope

This was a read-only analysis pass. No source cleanup was applied.

Checked:

- TypeScript baseline: `./node_modules/.bin/tsc --noEmit --pretty false`
- TypeScript unused locals/imports: `./node_modules/.bin/tsc --noEmit --noUnusedLocals --noUnusedParameters --pretty false`
- TypeScript unreachable code: `./node_modules/.bin/tsc --noEmit --allowUnreachableCode false --pretty false`
- Project lint: `./node_modules/.bin/vp lint .`
- Static import graph over `src`, `tests`, `scripts`, and top-level config files
- Manual grep checks for framework/Payload admin wiring and sidecar assets

Tooling notes:

- Windows PowerShell could read the WSL project, but `pnpm` was not available on Windows PATH.
- `pnpm` was also not available in the Ubuntu shell PATH.
- Local project binaries in `node_modules/.bin` were available and used instead.
- `rg` failed from the UNC path, so Git/PowerShell/WSL grep were used.

## Current Signals

| Check                            |            Result | Meaning                                                                                                              |
| -------------------------------- | ----------------: | -------------------------------------------------------------------------------------------------------------------- |
| Baseline TypeScript              |             clean | Existing project type-checks without unused enforcement.                                                             |
| Project lint                     |             clean | `vp lint .` found 0 warnings and 0 errors across 280 files.                                                          |
| TypeScript unreachable-code pass |             clean | No compiler-detected unreachable code.                                                                               |
| TypeScript unused pass           |    17 diagnostics | Mostly unused `React` imports plus one unused test parameter.                                                        |
| Import graph                     | 8 file candidates | Candidate files have zero inbound static imports after excluding known Next/Payload/test/script/config entry points. |

## High-Confidence Cleanup

### 1. Remove Unused React Imports

These are compiler-confirmed by `TS6133`. The project uses `jsx: "react-jsx"`, so JSX does not require a default `React` import.

| File                                                       | Before                                    | After                              |
| ---------------------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `src/Footer/Component.tsx`                                 | `import React from 'react'`               | remove import                      |
| `src/Header/Component.tsx`                                 | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/[slug]/page.tsx`                       | `import React, { cache } from 'react'`    | `import { cache } from 'react'`    |
| `src/app/(frontend)/contact/page.tsx`                      | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/inner-circle/page.tsx`                 | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/not-found.tsx`                         | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/posts/[slug]/page.tsx`                 | `import React, { cache } from 'react'`    | `import { cache } from 'react'`    |
| `src/app/(frontend)/posts/page.tsx`                        | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/posts/page/[pageNumber]/page.tsx`      | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/products/[slug]/ProductDetailTabs.tsx` | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/products/[slug]/page.tsx`              | `import React, { cache } from 'react'`    | `import { cache } from 'react'`    |
| `src/app/(frontend)/products/page.tsx`                     | `import React, { Suspense } from 'react'` | `import { Suspense } from 'react'` |
| `src/app/(frontend)/products/page/[pageNumber]/page.tsx`   | `import React from 'react'`               | remove import                      |
| `src/app/(frontend)/search/page.tsx`                       | `import React from 'react'`               | remove import                      |
| `src/blocks/Form/Error/index.tsx`                          | `import * as React from 'react'`          | remove import                      |
| `src/components/Logo/Logo.tsx`                             | `import React from 'react'`               | remove import                      |

Expected after: `tsc --noUnusedLocals --noUnusedParameters` no longer reports these 16 import diagnostics.

### 2. Rename or Remove One Unused Test Parameter

Compiler-confirmed by `TS6133`:

| File                             | Before                                                                  | After                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/int/syncEtsy.int.spec.ts` | `downloadAndRegisterMedia(listingId, etsyImageId, _imageUrl, _altText)` | Rename `listingId` to `_listingId` if the interface requires the parameter, or remove it if TypeScript still accepts the method signature. |

Recommended safe edit: rename to `_listingId`, matching the repo's lint convention for intentionally unused parameters.

Expected after: `tsc --noUnusedLocals --noUnusedParameters` no longer reports the test parameter.

### 3. Delete Unreferenced Source Files

These files have zero inbound static imports and no manual references in Payload config, generated import map, app routes, tests, or scripts.

| Candidate                                              | Evidence                                                                                                                                            | Safe before/after                                                                   |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/components/BeforeDashboard/SeedButton/index.tsx`  | Only self-referenced by export/class names; `BeforeDashboard` no longer imports it; Payload import map imports `BeforeDashboard`, not `SeedButton`. | Before: unused admin seed button remains in bundle candidates. After: file removed. |
| `src/components/BeforeDashboard/SeedButton/index.scss` | Only imported by `SeedButton/index.tsx`.                                                                                                            | Remove with `SeedButton`.                                                           |
| `src/components/ui/collapsible-section.tsx`            | Only self-referenced; not imported by app/components.                                                                                               | Before: unused wrapper around collapsible. After: file removed.                     |
| `src/components/ui/spinner.tsx`                        | Only self-referenced; docs mention a spinner concept, no runtime imports.                                                                           | Before: unused UI component. After: file removed.                                   |
| `src/components/ui/tooltip.tsx`                        | Only self-referenced and imports `@radix-ui/react-tooltip`; no runtime imports.                                                                     | Before: unused Tooltip wrapper. After: file removed.                                |
| `src/components/zoomable-image.tsx`                    | Only self-referenced and imports its CSS plus `react-medium-image-zoom`; no runtime imports.                                                        | Before: unused image wrapper. After: file removed.                                  |
| `src/components/zoomable-image.css`                    | Only imported by `zoomable-image.tsx`.                                                                                                              | Remove with `zoomable-image.tsx`.                                                   |
| `src/hooks/use-task.ts`                                | No imports found; appears to be an unused Inference.sh streaming hook.                                                                              | Before: unused hook. After: file removed.                                           |
| `src/utilities/getMeUser.ts`                           | No imports found; not wired into routes/admin config.                                                                                               | Before: unused auth helper. After: file removed.                                    |
| `src/utilities/toKebabCase.ts`                         | No imports found.                                                                                                                                   | Before: unused string helper. After: file removed.                                  |

Expected size change: about 545 source lines removed, plus 16 import lines and one parameter rename.

## Dependency Cleanup Candidates

Only remove dependencies after source cleanup and a full build. Static dependency scans can produce false positives for config/tooling packages, so this section is intentionally conservative.

High-confidence candidates if their only source consumers are removed:

| Package                   | Why it becomes removable                                                | Required verification                                                 |
| ------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `@radix-ui/react-tooltip` | Only static source import found in `src/components/ui/tooltip.tsx`.     | Delete tooltip component first, then run typecheck/lint/build.        |
| `react-medium-image-zoom` | Only static source import found in `src/components/zoomable-image.tsx`. | Delete zoomable image component first, then run typecheck/lint/build. |

Static scan also did not see imports for packages such as `@chenglou/pretext`, `@payloadcms/db-postgres`, `graphql`, `remark-*`, `unified`, and several dev tooling/type packages. Do not remove those in the first pass without checking Payload plugin behavior, config use, and generated/runtime requirements.

## Not Dead / Keep

These looked risky but are reachable by convention or config:

- `src/components/BeforeDashboard/index.tsx` is live through `payload.config.ts` `admin.components.beforeDashboard` and `src/app/(payload)/admin/importMap.js`.
- `src/components/admin/GenerateCopyButton.tsx` is live through `src/collections/Products.ts` admin field config and the Payload import map.
- Next app route files under `src/app/**` are entry points even when no imports point to them.
- Payload collections, globals, migrations, and generated `payload-types.ts` are reachable through Payload conventions/config.
- Scripts under `scripts/**` were treated as command entry points.

## Safe Execution Order

1. Remove the 16 unused `React` imports and rename `listingId` to `_listingId`.
2. Run:

   ```bash
   ./node_modules/.bin/tsc --noEmit --noUnusedLocals --noUnusedParameters --pretty false
   ./node_modules/.bin/vp lint .
   ```

3. Delete the high-confidence unreferenced source files and sidecar styles listed above.
4. Run:

   ```bash
   ./node_modules/.bin/tsc --noEmit --pretty false
   ./node_modules/.bin/vp lint .
   ./node_modules/.bin/next build
   ```

5. If the build passes, remove `@radix-ui/react-tooltip` and `react-medium-image-zoom` from `package.json` and update `pnpm-lock.yaml` using the project package manager once `pnpm` is available.
6. Run the full verification suite:

   ```bash
   ./node_modules/.bin/tsc --noEmit --pretty false
   ./node_modules/.bin/vp lint .
   ./node_modules/.bin/vp test run --config ./vitest.config.mts
   ./node_modules/.bin/playwright test --config=playwright.config.ts
   ./node_modules/.bin/next build
   ```

## Review Checklist Before Applying

- Confirm no active branch or local work depends on the unused UI primitives (`Tooltip`, `Spinner`, `CollapsibleSection`, `ZoomableImage`).
- Confirm `SeedButton` is intentionally obsolete; the current dashboard has no import or render path for it.
- Confirm `use-task.ts` is not planned for near-term Inference.sh UI work.
- Regenerate Payload import map only if Payload admin components change. The current deletion list does not remove import-map entries.
