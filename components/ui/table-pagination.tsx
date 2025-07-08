'use client'

import { Select } from './select'
import { 
  Pagination, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationList, 
  PaginationPage, 
  PaginationGap 
} from './pagination'

interface TablePaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  onPreviousPage,
  onNextPage
}: TablePaginationProps) {
  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    // Always show first page
    if (totalPages <= 1) return [1]

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, 'gap')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('gap', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-zinc-600 dark:text-zinc-400">
            Show
          </label>
          <Select
            value={pageSize.toString()}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="w-auto"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            per page
          </span>
        </div>
        
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing {startItem} to {endItem} of {total} results
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationPrevious 
            href={hasPreviousPage ? '#' : null}
            onClick={hasPreviousPage ? onPreviousPage : undefined}
          />
          
          <PaginationList>
            {visiblePages.map((pageNum, index) => (
              pageNum === 'gap' ? (
                <PaginationGap key={`gap-${index}`} />
              ) : (
                <PaginationPage
                  key={pageNum}
                  href="#"
                  current={pageNum === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(pageNum as number)
                  }}
                >
                  {pageNum}
                </PaginationPage>
              )
            ))}
          </PaginationList>

          <PaginationNext 
            href={hasNextPage ? '#' : null}
            onClick={hasNextPage ? onNextPage : undefined}
          />
        </Pagination>
      )}
    </div>
  )
}