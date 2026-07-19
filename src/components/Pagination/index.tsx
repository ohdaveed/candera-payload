'use client'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
  basePath?: string
  /**
   * Extra query params (e.g. active filters/sort) to preserve across page links.
   * When any value is set, links use `?{query}&page=N` on basePath instead of the
   * path-based `{basePath}/page/N` routes, so filters survive pagination.
   */
  query?: Record<string, string | undefined>
}> = (props) => {
  const { className, page, totalPages, basePath = '/posts', query } = props
  const queryEntries = Object.entries(query ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '',
  )

  const pageHref = (target: number): string => {
    if (queryEntries.length === 0) {
      // Page 1 lives at the base path itself; /page/1 only redirects there.
      return target === 1 ? basePath : `${basePath}/page/${target}`
    }
    const params = new URLSearchParams(queryEntries)
    if (target > 1) params.set('page', String(target))
    return `${basePath}?${params.toString()}`
  }

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            {hasPrevPage ? (
              <PaginationPrevious href={pageHref(page - 1)} />
            ) : (
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ size: 'default', variant: 'ghost' }),
                  'gap-1 pl-2.5 pointer-events-none opacity-50',
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </span>
            )}
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink aria-label={`Go to page ${page - 1}`} href={pageHref(page - 1)}>
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              aria-label={`Current page, page ${page}`}
              href={pageHref(page)}
              isActive
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink aria-label={`Go to page ${page + 1}`} href={pageHref(page + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            {hasNextPage ? (
              <PaginationNext href={pageHref(page + 1)} />
            ) : (
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ size: 'default', variant: 'ghost' }),
                  'gap-1 pr-2.5 pointer-events-none opacity-50',
                )}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
