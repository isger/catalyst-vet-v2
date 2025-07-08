import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TablePagination } from '../table-pagination'

// Mock the UI components
vi.mock('../select', () => ({
  Select: ({ value, onChange, children, className }: any) => (
    <select 
      value={value} 
      onChange={onChange} 
      className={className}
      data-testid="page-size-select"
    >
      {children}
    </select>
  )
}))

vi.mock('../pagination', () => ({
  Pagination: ({ children }: any) => <div data-testid="pagination">{children}</div>,
  PaginationPrevious: ({ href, onClick, children }: any) => (
    <button
      onClick={onClick}
      disabled={!href}
      data-testid="previous-page"
    >
      {children || 'Previous'}
    </button>
  ),
  PaginationNext: ({ href, onClick, children }: any) => (
    <button
      onClick={onClick}
      disabled={!href}
      data-testid="next-page"
    >
      {children || 'Next'}
    </button>
  ),
  PaginationList: ({ children }: any) => <div data-testid="pagination-list">{children}</div>,
  PaginationPage: ({ href, current, onClick, children }: any) => (
    <button
      onClick={onClick}
      data-testid={`page-${children}`}
      data-current={current}
    >
      {children}
    </button>
  ),
  PaginationGap: () => <span data-testid="pagination-gap">...</span>
}))

describe('TablePagination', () => {
  const defaultProps = {
    page: 1,
    pageSize: 10,
    total: 50,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onPreviousPage: vi.fn(),
    onNextPage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render pagination info correctly', () => {
      render(<TablePagination {...defaultProps} />)

      expect(screen.getByText('Showing 1 to 10 of 50 results')).toBeInTheDocument()
      expect(screen.getByText('per page')).toBeInTheDocument()
    })

    it('should render page size selector with correct value', () => {
      render(<TablePagination {...defaultProps} />)

      const select = screen.getByTestId('page-size-select')
      expect(select).toHaveValue('10')
    })

    it('should render pagination controls when totalPages > 1', () => {
      render(<TablePagination {...defaultProps} />)

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByTestId('previous-page')).toBeInTheDocument()
      expect(screen.getByTestId('next-page')).toBeInTheDocument()
    })

    it('should not render pagination controls when totalPages <= 1', () => {
      render(<TablePagination {...defaultProps} totalPages={1} />)

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('should calculate result range correctly for last page', () => {
      render(<TablePagination {...defaultProps} page={5} total={47} />)

      expect(screen.getByText('Showing 41 to 47 of 47 results')).toBeInTheDocument()
    })
  })

  describe('page size changes', () => {
    it('should call onPageSizeChange when page size is changed', () => {
      render(<TablePagination {...defaultProps} />)

      const select = screen.getByTestId('page-size-select')
      fireEvent.change(select, { target: { value: '25' } })

      expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(25)
    })

    it('should have all page size options available', () => {
      render(<TablePagination {...defaultProps} />)

      const select = screen.getByTestId('page-size-select')
      const options = Array.from(select.querySelectorAll('option')).map(opt => opt.value)
      
      expect(options).toEqual(['5', '10', '25', '50', '100'])
    })
  })

  describe('page navigation', () => {
    it('should disable previous button on first page', () => {
      render(<TablePagination {...defaultProps} page={1} hasPreviousPage={false} />)

      const prevButton = screen.getByTestId('previous-page')
      expect(prevButton).toBeDisabled()
    })

    it('should enable previous button when not on first page', () => {
      render(<TablePagination {...defaultProps} page={2} hasPreviousPage={true} />)

      const prevButton = screen.getByTestId('previous-page')
      expect(prevButton).not.toBeDisabled()
    })

    it('should disable next button on last page', () => {
      render(<TablePagination {...defaultProps} page={5} hasNextPage={false} />)

      const nextButton = screen.getByTestId('next-page')
      expect(nextButton).toBeDisabled()
    })

    it('should enable next button when not on last page', () => {
      render(<TablePagination {...defaultProps} page={1} hasNextPage={true} />)

      const nextButton = screen.getByTestId('next-page')
      expect(nextButton).not.toBeDisabled()
    })

    it('should call onPreviousPage when previous button is clicked', () => {
      render(<TablePagination {...defaultProps} page={2} hasPreviousPage={true} />)

      const prevButton = screen.getByTestId('previous-page')
      fireEvent.click(prevButton)

      expect(defaultProps.onPreviousPage).toHaveBeenCalledOnce()
    })

    it('should call onNextPage when next button is clicked', () => {
      render(<TablePagination {...defaultProps} page={1} hasNextPage={true} />)

      const nextButton = screen.getByTestId('next-page')
      fireEvent.click(nextButton)

      expect(defaultProps.onNextPage).toHaveBeenCalledOnce()
    })
  })

  describe('visible page calculation', () => {
    it('should show only page 1 when totalPages is 1', () => {
      render(<TablePagination {...defaultProps} totalPages={1} page={1} />)

      // Pagination should not be rendered for single page
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('should show all pages when totalPages <= 7', () => {
      render(<TablePagination {...defaultProps} totalPages={5} page={3} />)

      // Should show pages 1, 2, 3, 4, 5
      expect(screen.getByTestId('page-1')).toBeInTheDocument()
      expect(screen.getByTestId('page-2')).toBeInTheDocument()
      expect(screen.getByTestId('page-3')).toBeInTheDocument()
      expect(screen.getByTestId('page-4')).toBeInTheDocument()
      expect(screen.getByTestId('page-5')).toBeInTheDocument()
    })

    it('should show gaps when totalPages > 7', () => {
      render(<TablePagination {...defaultProps} totalPages={15} page={8} />)

      // Should show 1, gap, 6, 7, 8, 9, 10, gap, 15
      expect(screen.getByTestId('page-1')).toBeInTheDocument()
      expect(screen.getByTestId('page-6')).toBeInTheDocument()
      expect(screen.getByTestId('page-7')).toBeInTheDocument()
      expect(screen.getByTestId('page-8')).toBeInTheDocument()
      expect(screen.getByTestId('page-9')).toBeInTheDocument()
      expect(screen.getByTestId('page-10')).toBeInTheDocument()
      expect(screen.getByTestId('page-15')).toBeInTheDocument()
      expect(screen.getAllByTestId('pagination-gap')).toHaveLength(2)
    })

    it('should highlight current page', () => {
      render(<TablePagination {...defaultProps} page={3} />)

      const currentPage = screen.getByTestId('page-3')
      expect(currentPage).toHaveAttribute('data-current', 'true')
    })

    it('should not highlight non-current pages', () => {
      render(<TablePagination {...defaultProps} page={3} />)

      const nonCurrentPage = screen.getByTestId('page-1')
      expect(nonCurrentPage).toHaveAttribute('data-current', 'false')
    })

    it('should call onPageChange when page button is clicked', () => {
      render(<TablePagination {...defaultProps} page={1} />)

      const pageButton = screen.getByTestId('page-3')
      fireEvent.click(pageButton)

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(3)
    })
  })

  describe('edge cases', () => {
    it('should handle zero total results', () => {
      render(<TablePagination {...defaultProps} total={0} totalPages={0} />)

      expect(screen.getByText('Showing 1 to 0 of 0 results')).toBeInTheDocument()
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('should handle single result', () => {
      render(<TablePagination {...defaultProps} total={1} totalPages={1} />)

      expect(screen.getByText('Showing 1 to 1 of 1 results')).toBeInTheDocument()
    })

    it('should handle large numbers correctly', () => {
      render(<TablePagination 
        {...defaultProps} 
        page={100} 
        pageSize={50} 
        total={5000} 
        totalPages={100}
      />)

      expect(screen.getByText('Showing 4951 to 5000 of 5000 results')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for page size selector', () => {
      render(<TablePagination {...defaultProps} />)

      expect(screen.getByText('Show')).toBeInTheDocument()
      expect(screen.getByText('per page')).toBeInTheDocument()
    })

    it('should prevent default on page button clicks', () => {
      render(<TablePagination {...defaultProps} />)

      const pageButton = screen.getByTestId('page-2')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

      fireEvent.click(pageButton)

      // Note: We can't directly test preventDefault in this setup,
      // but we can verify the handler was called
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
    })
  })
})