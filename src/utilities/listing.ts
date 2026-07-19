import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

/**
 * Shared plumbing for the paginated listing routes (posts, how-to, products) —
 * FE-02 in docs/tech-debt-remediation-2026-07-16.md. This module is pure
 * (no Payload/DB imports) so the semantics stay unit-testable; the paginated
 * query wrapper lives in `./listingQuery`.
 */

/** Every listing route pages its collection in dozens. */
export const LISTING_PAGE_SIZE = 12

export type PageParamResolution =
  | { kind: 'not-found' }
  | { kind: 'redirect'; to: string }
  | { kind: 'page'; page: number }

/**
 * Pure decision function for `{basePath}/page/[pageNumber]` params, copying the
 * canonical semantics from the products paged route:
 * - non-integer or < 1 → 404
 * - page 1 → redirect to the base route (it duplicates the canonical listing)
 * - alternate integer spellings ('02', '2e0') → redirect to the canonical URL,
 *   so duplicate content never ships under non-canonical spellings
 */
export function resolvePageParam(pageNumber: string, basePath: string): PageParamResolution {
  const parsed = Number(pageNumber)

  if (!Number.isInteger(parsed) || parsed < 1) return { kind: 'not-found' }

  if (parsed === 1) return { kind: 'redirect', to: basePath }

  if (String(parsed) !== pageNumber) return { kind: 'redirect', to: `${basePath}/page/${parsed}` }

  return { kind: 'page', page: parsed }
}

/**
 * Route-side wrapper over {@link resolvePageParam}: 404s or redirects as
 * decided, otherwise returns the sanitized page number.
 */
export function sanitizePageParam(pageNumber: string, basePath: string): number {
  const resolution = resolvePageParam(pageNumber, basePath)

  if (resolution.kind === 'not-found') notFound()
  if (resolution.kind === 'redirect') redirect(resolution.to)

  return resolution.page
}

/** Out-of-range page numbers should 404 rather than render an empty grid. */
export function assertPageInRange(page: number, totalPages: number | null | undefined): void {
  if (page > (totalPages || 1)) notFound()
}

type ListingMetadataArgs = {
  /** Listing title prefix, e.g. 'Journal' → 'Journal — Candera'. */
  titlePrefix: string
  description: string
  /** Canonical base route, e.g. '/posts'. */
  basePath: string
}

/** Metadata for a listing's base route — the canonical home of page 1. */
export function listingMetadata({
  titlePrefix,
  description,
  basePath,
}: ListingMetadataArgs): Metadata {
  const title = `${titlePrefix} — Candera`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: basePath },
  }
}

/** Metadata for a `{basePath}/page/[pageNumber]` route, with a self-referencing canonical. */
export function pagedListingMetadata({
  titlePrefix,
  description,
  basePath,
  pageNumber,
}: ListingMetadataArgs & { pageNumber: string }): Metadata {
  // Normalize alternate integer spellings so the canonical always matches the
  // URL the page component redirects to (non-numeric segments 404 anyway).
  const parsed = Number(pageNumber)
  const canonicalPage = Number.isInteger(parsed) && parsed >= 1 ? String(parsed) : pageNumber
  const title = `${titlePrefix} — Page ${canonicalPage} — Candera`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `${basePath}/page/${canonicalPage}` },
  }
}
