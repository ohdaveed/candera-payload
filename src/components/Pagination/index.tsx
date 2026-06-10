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
            {hasPrevPage ? (
              <PaginationPrevious href={`${basePath}/page/${page - 1}`} />
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
            {hasNextPage ? (
              <PaginationNext href={`${basePath}/page/${page + 1}`} />
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
