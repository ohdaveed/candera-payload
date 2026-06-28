# Plan: GEMINI.md Optimization for Workflow and Token Usage

**Date:** 2026-06-28  
**Scope:** Reorganizing and optimizing `GEMINI.md` to reduce the context token footprint and improve developer workflow for AI models working in this codebase.

---

## 1. Understanding Summary
* **Goal**: Refactor and repurpose [GEMINI.md](file:///home/ohdaveed/projects/candera-payload/GEMINI.md) to optimize developer flow and minimize the token footprint of system instructions.
* **Problem**: The current `GEMINI.md` contains redundant tables, directories, and stack definitions that overlap with [CLAUDE.md](file:///home/ohdaveed/projects/candera-payload/CLAUDE.md) and [AGENTS.md](file:///home/ohdaveed/projects/candera-payload/AGENTS.md), resulting in wasted tokens on every conversation turn.
* **Key Constraints**: 
  * Target file size under 1.5 KB (less than 40 lines).
  * Exclude redundant static commands/directories.
  * Focus strictly on LLM behavior rules (styling type-scale, focus states, dynamic imports, and database migration rules).

---

## 2. Assumptions
* [AGENTS.md](file:///home/ohdaveed/projects/candera-payload/AGENTS.md) and [CLAUDE.md](file:///home/ohdaveed/projects/candera-payload/CLAUDE.md) serve as the primary references for dev commands, environment variables, database setup, and credentials.
* AI agents can query the file system dynamically using sandbox tools rather than needing static folder trees in instructions.

---

## 3. Decision Log
* **Decision**: Focus `GEMINI.md` exclusively on strict coding guardrails and styling constraints.
* **Alternatives Considered**: 
  1. *Functional Block Structure*: Keep a minimal project summary but group rules by functional categories (estimated size: ~1.4 KB).
  2. *Retaining Commands List (Compressed)*: Shrink the command tables to plain bullet points but keep them in `GEMINI.md` (estimated size: ~2.0 KB).
* **Rationale for Selection**: Option 1 (pure guardrails) was selected because it maximizes token savings (~75% reduction) and ensures the LLM's context window contains highly focused, non-negotiable styling and architecture directives instead of duplicative CLI documentation.

---

## 4. Key Risks & Mitigation
* **Risk**: The AI might fail to remember helper commands if they are removed from `GEMINI.md`.
* **Mitigation**: Critical commands are still thoroughly documented in [CLAUDE.md](file:///home/ohdaveed/projects/candera-payload/CLAUDE.md) and [AGENTS.md](file:///home/ohdaveed/projects/candera-payload/AGENTS.md), which are automatically loaded into the workspace rules.

---

## 5. Final Design

The new [GEMINI.md](file:///home/ohdaveed/projects/candera-payload/GEMINI.md) content will be as follows:

```markdown
# Candera: Botanical Scent Studio — LLM Guidelines

This file serves as a high-density reference for AI assistants. For commands, environment variables, and setup instructions, refer to `CLAUDE.md` and `AGENTS.md`.

## 1. UI & Styling Constraints
* **Type Scale**: Use only Tailwind font-size tokens (`text-hero`, `text-3xl`, `text-2xl`, `text-xl`, `text-lg`, `text-base`, `text-sm`, `text-xs`). Do not write custom `clamp()` expressions in CSS.
* **Focus States**: Never suppress outline (`outline-none`) without pairing it with a `focus-visible:ring-*`. Use the mapped brand color `--ring` (`var(--candera-ember-strong)`) via `ring-ring`.
* **Dynamic Imports**: Client-only components that rely on browser APIs or Framer Motion (e.g., `ScentQuizModal`) must be loaded dynamically using `{ ssr: false, loading: () => ... }`.

## 2. Technical Architecture Rules
* **Etsy Sync Engine**: Strictly enforce Hexagonal Architecture. Keep domain logic decoupled from external I/O behind ports and adapters in `src/utilities/syncEtsy.ts`.
* **Database & Migrations**: Schema push is disabled. Any field or collection changes must generate a new migration file via `pnpm payload migrate:create`.
* **Revalidation**: On-demand ISR must use `revalidateTag(tag, 'max')` on collection hook updates (`src/utilities/revalidate.ts`).

## 3. Code Style & Verification
* **Conventions**: TypeScript strict mode, single quotes, NO semicolons, trailing commas, 100-character print width.
* **Quality Checklist**: Format, lint, and test changes using `vp check` and `vp test` prior to submitting.
```

---

## 6. Implementation Plan
1. Overwrite [GEMINI.md](file:///home/ohdaveed/projects/candera-payload/GEMINI.md) with the finalized design contents.
2. Verify that `vp check` (linting/formatting) still passes cleanly.
