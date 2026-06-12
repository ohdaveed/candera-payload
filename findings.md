# Findings

Repository observations for the unused-code analysis.

## Verified checks

- Baseline `./node_modules/.bin/tsc --noEmit --pretty false`: clean output.
- `./node_modules/.bin/vp lint .`: 0 warnings, 0 errors across 280 files.
- `./node_modules/.bin/tsc --noEmit --allowUnreachableCode false --pretty false`: clean output.
- `./node_modules/.bin/tsc --noEmit --noUnusedLocals --noUnusedParameters --pretty false`: 17 diagnostics.

## Cleanup candidates

- 16 unused `React` imports reported by TypeScript.
- 1 unused test parameter in `tests/int/syncEtsy.int.spec.ts`.
- 8 zero-inbound source files from import graph: `SeedButton`, `collapsible-section`, `spinner`, `tooltip`, `zoomable-image`, `use-task`, `getMeUser`, `toKebabCase`.
- Sidecar styles tied to dead components: `SeedButton/index.scss`, `zoomable-image.css`.
- Potential package cleanup after source deletion: `@radix-ui/react-tooltip`, `react-medium-image-zoom`.

## Keep / not dead

- `BeforeDashboard` is live through Payload admin config and generated import map.
- `GenerateCopyButton` is live through Products admin field config and generated import map.
- Next route files, Payload collections/globals/migrations/generated types, and scripts were treated as entry points.
