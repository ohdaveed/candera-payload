# Design Review & Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the UI's alignment with Vercel's Web Interface Guidelines by fixing specific typography, animation, and markup issues.

**Architecture:** We will systematically update existing components, adjusting tailwind classes for text-wrap and explicit transitions, ensuring buttons have correct types to prevent implicit submissions, and fixing form labelling issues.

**Tech Stack:** React, TailwindCSS, Next.js

---

### Task 1: Typography - Balance Headings
**Goal:** Add `text-balance` to heading elements (`h1` - `h6`) to improve typography layout as per the guidelines.

**Files:**
- Modify: `src/heros/PostHero/index.tsx`
- Modify: `src/components/Card/index.tsx`
- Modify: `src/components/BeforeDashboard/index.tsx`

- [x] **Step 1: Update `src/heros/PostHero/index.tsx`**
- [x] **Step 2: Update `src/components/Card/index.tsx`**
- [x] **Step 3: Update `src/components/BeforeDashboard/index.tsx`**
- [x] **Step 4: Commit**

### Task 2: Animation Anti-pattern - Remove transition-all
**Goal:** Replace `transition-all` with explicit transition properties to improve performance as per the "Never use transition: all" guideline.

**Files:**
- Modify: `src/Header/Component.client.tsx`

- [x] **Step 1: Update `src/Header/Component.client.tsx`**
- [x] **Step 2: Commit**

### Task 3: Accessibility - Button Type
**Goal:** Ensure generic buttons without a form context default to `type="button"` to avoid unintended submit actions.

**Files:**
- Modify: `src/components/BeforeDashboard/SeedButton/index.tsx`

- [x] **Step 1: Update `src/components/BeforeDashboard/SeedButton/index.tsx`**
- [x] **Step 2: Commit**

---

### Additional Polishing Tasks (Completed)
- [x] **Punctuation:** Updated `src/components/BeforeDashboard/SeedButton/index.tsx` to use proper ellipsis (`…`) instead of `...`.
- [x] **Punctuation:** Updated `src/search/Component.tsx` placeholder to use proper ellipsis.
- [x] **Typography:** Applied `tabular-nums` (via `.price` class) to product prices in `src/components/Card/index.tsx` and `src/app/(frontend)/products/[slug]/page.tsx` for better alignment.
