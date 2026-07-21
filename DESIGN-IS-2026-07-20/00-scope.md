# Scope

**Audited:** Claude Design project "Photo design creation" (`853d02a7-120d-4fae-beb8-5fb44f789a78`). Read via DesignSync `list_files`/`get_file`.

**Contents:** tokens (`colors.css`,`typography.css`,`spacing.css`,`effects.css`), component library (`brand/MoonMark`,`brand/Wordmark`,`core/Button`,`core/Input`,`core/SectionHeading`,`core/Tag`,`commerce/ProductCard`), UI kit (`ui_kits/storefront/Home.jsx`,`ProductDetail.jsx`,`CartDrawer.jsx`), six `.dc.html` interactive page mockups (`Candera Candles`,`About`,`Contact`,`Events`,`Upcoming Events`,`Scent Quiz`), `readme.md` brand spec.

**Implementation target:** `candera-payload` — live Next.js 16 + Payload CMS storefront for the same brand, already selling 9 real published candles synced from Etsy (confirmed via direct Neon query this session). This is a redesign evaluation against a live commerce backend, not a from-scratch build.

**Primary user / task:** a shopper browsing → product detail → add to cart → Etsy checkout handoff; secondary reader of About/Events/Contact/Quiz content.

**Constraints:** must eventually map onto Tailwind v4 / shadcn / RSC (design is plain inline-style React/HTML); no documented a11y floor, WCAG AA assumed.

**Note:** this audit was a user-approved detour from the original "implement the designs" ask, per the `design-is` skill contract — ends at a `/make-plan` handoff, not code. Due to context budget, evidence in Phase 1 was gathered directly by the orchestrator from already-fetched file contents rather than via separate subagent dispatch — still evidence-cited per file, just not subagent-delegated.
