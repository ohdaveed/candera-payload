# Vercel Deployment Failure Resolution Plan

## Diagnosis
The latest deployment failed immediately after a series of high-risk changes in commit `82af8f7ec9a201104fee34a9c2ba3b2d6eae175b`. Key potential issues identified:
1. **pnpm 11 Upgrade**: The project was upgraded to pnpm 11.5.0. pnpm 11 ignores `pnpm.overrides` and `pnpm.onlyBuiltDependencies` in `package.json`, which are critical for `sharp` (image processing) and `esbuild`. This likely causes `next build` to fail or `sharp` to be missing.
2. **Missing Meta in Product Card**: The "minification" logic in `src/app/(frontend)/products/page.tsx` stripped the `meta` field, which the `Card` component uses for its primary image. While not a crash, it's a regression.
3. **Font Loading**: `EB_Garamond` was added via `next/font/google`, but its configuration might be missing some weights if needed by the design.
4. **Dynamic Imports**: Some blocks were moved to `dynamic` imports, which might affect SSR or build-time optimization in the app router if not handled correctly.

## Proposed Fixes

### 1. Revert pnpm to version 10.x
Reverting to a stable pnpm version will restore support for `overrides` and `onlyBuiltDependencies` in `package.json`, ensuring `sharp` and other native modules are built correctly on Vercel.

### 2. Fix Product Card Data
Ensure `meta` is included in the minimized document passed to the `Card` component in `src/app/(frontend)/products/page.tsx`.

### 3. Polish Font Configuration
Refine the `EB_Garamond` configuration to include necessary weights and ensure it matches the editorial style.

### 4. Verify Payload Config
Ensure `payload.config.ts` handles the `BLOB_READ_WRITE_TOKEN` gracefully during build time if it's not present.

## Implementation Steps

1. **Downgrade pnpm**: Update `package.json` to use `pnpm@10.33.0` and regenerate the lockfile (or restore it from git history).
2. **Update `products/page.tsx`**: Add `meta` to the `minimizedDoc`.
3. **Adjust `layout.tsx`**: Ensure `EB_Garamond` has the expected weights.
4. **Test Build Locally**: Run `pnpm build` (ignoring blob errors if possible) to verify code integrity.
