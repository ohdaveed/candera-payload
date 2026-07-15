# Login page theme cycler — design

## Purpose

Give the admin a one-click way, from the Payload dashboard, to change the background color of the non-authorized (login) page. Distinct from the existing `ThemePresetSwitcher`, which controls the public storefront's theme via the `SiteTheme` global — that mechanism does not reach the admin login screen at all.

## Color set

Fixed array of 9 hex colors, cycled in order:

```
faeffd, 615e62, beb8bf, 3d3b3e, 1f1e1f, 827e83, d7d7d7, dad0dc, a39fa4
```

Lives in code as `LOGIN_THEME_COLORS` (not editable via the admin UI in this iteration).

## Interaction model

A single "Next color" button on the admin dashboard. Each click advances to the next color in the array, wrapping from index 8 back to 0. Not a swatch grid — strictly sequential, matching "cycle through" literally.

## Applied scope

The chosen color paints the **full login page background**. Text/foreground color auto-switches between two fixed values, reused from the same palette for visual consistency: `#faeffd` (light text, for dark backgrounds) or `#1f1e1f` (dark text, for light backgrounds). The choice is driven by perceived brightness (YIQ luma: `(0.299*R + 0.587*G + 0.114*B) / 255`) of the background color — luma ≥ 0.5 gets dark text, below 0.5 gets light text. This keeps the wordmark and Payload's native form labels legible at every step of the cycle.

Confirmed via `@payloadcms/next`'s compiled styles: the login page wrapper (`.template-minimal`) already reads two CSS custom properties directly:

```css
.template-minimal {
  background-color: var(--theme-bg-color);
  color: var(--theme-text);
}
```

There is no separate "card" surface behind the login form — input fields use their own elevation surface (`--theme-elevation-0` etc.), which stays legible regardless of the page background. So the implementation only needs to override `--theme-bg-color` and `--theme-text`, scoped to `.template-minimal`, per selected color. No deeper CSS restructuring is required.

## Data model

New Payload global, kept separate from `SiteTheme` (storefront-only, per existing convention) and from Payload's built-in admin theme (unaffected):

- **Global slug:** `login-theme`
- **Config location:** `src/LoginTheme/config.ts`
- **Field:** `colorIndex` (number, min 0, max 8, default 0)

Only the index is persisted; the color array itself lives in code, mirroring the `themePresets.ts` pattern already used by `ThemePresetSwitcher`.

Register the global in `src/payload.config.ts` alongside the other globals (`Header`, `Footer`, `SiteTheme`, `StudioInfo`).

## Components

### `LoginThemeCycler` (new, in `src/components/BeforeDashboard/`)

- Added to the `BeforeDashboard` composition (`src/components/BeforeDashboard/index.tsx`), alongside the existing `ThemePresetSwitcher`.
- On mount: `GET /api/globals/login-theme` (JWT via `useAuth()`, same pattern as `ThemePresetSwitcher`) to read the current `colorIndex`.
- On click: `PATCH /api/globals/login-theme` with `colorIndex: (current + 1) % 9`.
- Shows the current color as a swatch next to the button, plus a loading state while the PATCH is in flight.
- On PATCH failure: show an inline error message, do not advance the displayed swatch.

### `BeforeLogin` (rewritten, `src/components/BeforeLogin/index.tsx`)

- Becomes an **async server component**. Reads the current global directly via Payload's Local API (`payload.findGlobal({ slug: 'login-theme' })`) — no REST/JWT needed since this renders server-side, before authentication.
- Looks up the corresponding hex from `LOGIN_THEME_COLORS[colorIndex]`.
- Computes relative luminance from the hex to pick a text color (near-white or near-black).
- Renders an inline `<style>` tag scoped to `.template-minimal`, overriding `--theme-bg-color` and `--theme-text` with the computed values.
- If the global fetch fails (e.g. DB unavailable), falls back to `colorIndex = 0` rather than throwing — the login page must never fail to render because of this feature.

## Error handling

| Failure | Behavior |
|---|---|
| PATCH from dashboard button fails | Inline error text under the button; swatch/index unchanged |
| `findGlobal` fails on login page render | Falls back to index 0 (first color); no crash |
| `colorIndex` out of bounds (e.g. stale value from a future larger array) | Clamp via modulo when indexing into `LOGIN_THEME_COLORS` |

## Testing

- **Int test** (`tests/int/`): PATCHing `login-theme` global wraps `colorIndex` 8 → 0 correctly (via the cycler's increment logic, or as an endpoint-level test hitting `/api/globals/login-theme`).
- **Int test**: luminance/contrast helper returns the light text color for the darkest input (`#1f1e1f`) and the dark text color for the lightest input (`#faeffd`).

## Out of scope

- Editing the color list via the admin UI (hardcoded array only, for now).
- Applying the theme to any page other than the login screen.
- Any change to the admin panel's own (Payload built-in) theme switcher, or to the storefront `SiteTheme`/`ThemePresetSwitcher` system.

## Migration

New global requires the standard project workflow: `pnpm generate:types` and `pnpm payload migrate:create`, both committed.
