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
import { cn } from '@/utilities/ui'
import React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
  basePath?: string
}> = (props) => {
  const { className, page, totalPages, basePath = '/posts' } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={!hasPrevPage}
              className={!hasPrevPage ? 'pointer-events-none opacity-50' : undefined}
              href={hasPrevPage ? `${basePath}/page/${page - 1}` : '#'}
            />
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink
                aria-label={`Go to page ${page - 1}`}
                href={`${basePath}/page/${page - 1}`}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              aria-label={`Current page, page ${page}`}
              href={`${basePath}/page/${page}`}
              isActive
            >
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink
                aria-label={`Go to page ${page + 1}`}
                href={`${basePath}/page/${page + 1}`}
              >
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
            <PaginationNext
              aria-disabled={!hasNextPage}
              className={!hasNextPage ? 'pointer-events-none opacity-50' : undefined}
              href={hasNextPage ? `${basePath}/page/${page + 1}` : '#'}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
