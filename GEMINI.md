# Candera: Botanical Scent Studio — LLM Guidelines

This file serves as a high-density reference for AI assistants. For commands, environment variables, and setup instructions, refer to `CLAUDE.md` and `AGENTS.md`.

## 1. UI & Styling Constraints

- **Type Scale**: Use only Tailwind font-size tokens (`text-hero`, `text-3xl`, `text-2xl`, `text-xl`, `text-lg`, `text-base`, `text-sm`, `text-xs`). Do not write custom `clamp()` expressions in CSS.
- **Focus States**: Never suppress outline (`outline-none`) without pairing it with a `focus-visible:ring-*`. Use the mapped brand color `--ring` (`var(--candera-ember-strong)`) via `ring-ring`.
- **Dynamic Imports**: Client-only components that rely on browser APIs or Framer Motion (e.g., `ScentQuizModal`) must be loaded dynamically using `{ ssr: false, loading: () => ... }`.

## 2. Technical Architecture Rules

- **Etsy Sync Engine**: Strictly enforce Hexagonal Architecture. Keep domain logic decoupled from external I/O behind ports and adapters in `src/utilities/syncEtsy.ts`.
- **Database & Migrations**: Schema push is disabled. Any field or collection changes must generate a new migration file via `pnpm payload migrate:create`.
- **Revalidation**: On-demand ISR must use `revalidateTag(tag, 'max')` on collection hook updates (`src/utilities/revalidate.ts`).

## 3. Code Style & Verification

- **Conventions**: TypeScript strict mode, single quotes, NO semicolons, trailing commas, 100-character print width.
- **Quality Checklist**: Format, lint, and test changes using `vp check` and `vp test` prior to submitting.
