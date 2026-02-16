"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParamName?: string
  className?: string
}

export function PaginationControl({
  currentPage,
  totalPages,
  baseUrl,
  searchParamName = "page",
  className,
}: PaginationControlProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?"
    return `${baseUrl}${separator}${searchParamName}=${page}`
  }

  return (
    <div className={className}>
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={getPageUrl(currentPage - 1)} />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNumber = i + 1
            // Show first, last, current, and surrounding pages
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={getPageUrl(pageNumber)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            return null
          })}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={getPageUrl(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  )
}
