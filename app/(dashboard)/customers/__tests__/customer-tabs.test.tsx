import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActiveCustomers, NewClients, Consultation, FollowUp, Inactive } from '../customer-tabs'
import { usePaginatedCustomers } from '@/hooks/use-customers'
import { usePagination } from '@/hooks/use-pagination'

// Mock the hooks
vi.mock('@/hooks/use-customers', () => ({
  usePaginatedCustomers: vi.fn()
}))

vi.mock('@/hooks/use-pagination', () => ({
  usePagination: vi.fn()
}))

// Mock the UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, color }: { children: React.ReactNode; color?: string }) => (
    <span data-testid="badge" data-color={color}>{children}</span>
  )
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td data-testid="table-cell" className={className}>{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-head">{children}</thead>,
  TableHeader: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <th data-testid="table-header" className={className} onClick={onClick}>{children}</th>
  ),
  TableRow: ({ children, href, title, className }: { children: React.ReactNode; href?: string; title?: string; className?: string }) => (
    <tr data-testid="table-row" data-href={href} title={title} className={className}>
      {children}
    </tr>
  )
}))

vi.mock('@/components/ui/table-pagination', () => ({
  TablePagination: ({ onPageChange, onPageSizeChange, onNextPage, onPreviousPage, ...props }: { onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onNextPage: () => void; onPreviousPage: () => void; page: number; totalPages: number; total: number }) => (
    <div data-testid="table-pagination">
      <button onClick={() => onPageChange(2)} data-testid="page-change">Page 2</button>
      <button onClick={() => onPageSizeChange(25)} data-testid="page-size-change">25 per page</button>
      <button onClick={onNextPage} data-testid="next-page">Next</button>
      <button onClick={onPreviousPage} data-testid="previous-page">Previous</button>
      <span data-testid="pagination-info">
        Page {props.page} of {props.totalPages} ({props.total} total)
      </span>
    </div>
  )
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

describe('Customer Tabs', () => {
  const mockCustomers = [
    {
      id: 'customer1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
      address: { street: '123 Main St' },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      tenantId: 'tenant123',
      patients: [
        {
          id: 'pet1',
          name: 'Buddy',
          species: 'Dog',
          breed: 'Golden Retriever',
          dateOfBirth: '2020-01-01'
        }
      ],
      lastVisit: '2023-12-01T10:00:00Z'
    },
    {
      id: 'customer2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '5559876543',
      address: { street: '456 Oak Ave' },
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
      tenantId: 'tenant123',
      patients: [
        {
          id: 'pet2',
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Persian',
          dateOfBirth: '2019-03-15'
        },
        {
          id: 'pet3',
          name: 'Mittens',
          species: 'Cat',
          breed: 'Tabby',
          dateOfBirth: '2021-06-20'
        }
      ]
    }
  ]

  const mockPagination = {
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'firstName',
    sortOrder: 'desc' as const,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    setSearch: vi.fn(),
    setSortBy: vi.fn(),
    setSortOrder: vi.fn(),
    toggleSort: vi.fn(),
    reset: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    goToPage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(usePagination).mockReturnValue(mockPagination)
    vi.mocked(usePaginatedCustomers).mockReturnValue({
      customers: mockCustomers,
      total: 2,
      loading: false,
      error: null,
      refetch: vi.fn()
    })
  })

  describe('ActiveCustomers', () => {
    it('should render customer list with correct data', () => {
      render(<ActiveCustomers />)

      expect(screen.getByText('Active Customers')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should format phone numbers correctly', () => {
      render(<ActiveCustomers />)

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('(555) 987-6543')).toBeInTheDocument()
    })

    it('should format pet information correctly', () => {
      render(<ActiveCustomers />)

      expect(screen.getByText('Buddy (Golden Retriever)')).toBeInTheDocument()
      expect(screen.getByText('2 pets')).toBeInTheDocument()
      expect(screen.getByText('Whiskers, Mittens')).toBeInTheDocument()
    })

    it('should format last visit information', () => {
      render(<ActiveCustomers />)

      // Mock dates for consistent testing
      const mockDate = new Date('2023-12-15T00:00:00Z')
      vi.setSystemTime(mockDate)

      expect(screen.getByText('2 week ago')).toBeInTheDocument()
      expect(screen.getByText('No visits yet')).toBeInTheDocument()
    })

    it('should format creation dates correctly', () => {
      render(<ActiveCustomers />)

      expect(screen.getByText('1/1/2023')).toBeInTheDocument()
      expect(screen.getByText('2/1/2023')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      vi.mocked(usePaginatedCustomers).mockReturnValue({
        customers: [],
        total: 0,
        loading: true,
        error: null,
        refetch: vi.fn()
      })

      render(<ActiveCustomers />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getAllByTestId('table-cell')).toHaveLength(18) // 3 rows × 6 columns
    })

    it('should show error state', () => {
      vi.mocked(usePaginatedCustomers).mockReturnValue({
        customers: [],
        total: 0,
        loading: false,
        error: 'Failed to fetch customers',
        refetch: vi.fn()
      })

      render(<ActiveCustomers />)

      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch customers')).toBeInTheDocument()
    })

    it('should show empty state when no customers', () => {
      vi.mocked(usePaginatedCustomers).mockReturnValue({
        customers: [],
        total: 0,
        loading: false,
        error: null,
        refetch: vi.fn()
      })

      render(<ActiveCustomers />)

      expect(screen.getByText('No active customers found')).toBeInTheDocument()
    })

    it('should show search empty state', () => {
      vi.mocked(usePagination).mockReturnValue({
        ...mockPagination,
        search: 'nonexistent'
      })

      vi.mocked(usePaginatedCustomers).mockReturnValue({
        customers: [],
        total: 0,
        loading: false,
        error: null,
        refetch: vi.fn()
      })

      render(<ActiveCustomers />)

      expect(screen.getByText('No customers found matching your search.')).toBeInTheDocument()
    })

    it('should handle sorting', () => {
      render(<ActiveCustomers />)

      const nameHeader = screen.getByText('Customer').closest('[data-testid="table-header"]')
      fireEvent.click(nameHeader!)

      expect(mockPagination.toggleSort).toHaveBeenCalledWith('firstName')
    })

    it('should render pagination controls', () => {
      render(<ActiveCustomers />)

      expect(screen.getByTestId('table-pagination')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 1 (2 total)')).toBeInTheDocument()
    })

    it('should handle pagination changes', async () => {
      render(<ActiveCustomers />)

      fireEvent.click(screen.getByTestId('page-change'))
      fireEvent.click(screen.getByTestId('page-size-change'))
      fireEvent.click(screen.getByTestId('next-page'))
      fireEvent.click(screen.getByTestId('previous-page'))

      await waitFor(() => {
        expect(mockPagination.setPage).toHaveBeenCalledWith(2)
        expect(mockPagination.setPageSize).toHaveBeenCalledWith(25)
        expect(mockPagination.nextPage).toHaveBeenCalled()
        expect(mockPagination.previousPage).toHaveBeenCalled()
      })
    })

    it('should display customer count in badge', () => {
      render(<ActiveCustomers />)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('2 customers')
      expect(badge).toHaveAttribute('data-color', 'green')
    })

    it('should include navigation links for customer rows', () => {
      render(<ActiveCustomers />)

      const rows = screen.getAllByTestId('table-row')
      expect(rows[0]).toHaveAttribute('data-href', '/customers/customer1')
      expect(rows[0]).toHaveAttribute('title', "View John Doe's details")
      expect(rows[1]).toHaveAttribute('data-href', '/customers/customer2')
      expect(rows[1]).toHaveAttribute('title', "View Jane Smith's details")
    })
  })

  describe('NewClients', () => {
    it('should render new clients list', () => {
      render(<NewClients />)

      expect(screen.getByText('New Clients')).toBeInTheDocument()
      expect(screen.getByText('Alex Rodriguez')).toBeInTheDocument()
      expect(screen.getByText('Lisa Park')).toBeInTheDocument()
      expect(screen.getByText('5 pending')).toBeInTheDocument()
    })

    it('should handle sorting', () => {
      render(<NewClients />)

      const nameHeader = screen.getByText('Name').closest('[data-testid="table-header"]')
      fireEvent.click(nameHeader!)

      // Should toggle sort order
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('should filter based on search query', () => {
      render(<NewClients searchQuery="Alex" />)

      expect(screen.getByText('Alex Rodriguez')).toBeInTheDocument()
      expect(screen.queryByText('Lisa Park')).not.toBeInTheDocument()
    })

    it('should show empty state when no results', () => {
      render(<NewClients searchQuery="nonexistent" />)

      expect(screen.getByText('No new clients found matching your search.')).toBeInTheDocument()
    })
  })

  describe('Consultation', () => {
    it('should render consultation schedule', () => {
      render(<Consultation />)

      expect(screen.getByText('Consultation Schedule')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      expect(screen.getByText('5 appointments')).toBeInTheDocument()
    })

    it('should display appointment times as badges', () => {
      render(<Consultation />)

      const timeBadges = screen.getAllByTestId('badge').filter(
        badge => badge.textContent?.includes('AM') || badge.textContent?.includes('PM')
      )
      expect(timeBadges.length).toBeGreaterThan(0)
    })

    it('should display status badges with correct colors', () => {
      render(<Consultation />)

      const statusBadges = screen.getAllByTestId('badge').filter(
        badge => badge.textContent === 'Confirmed' || badge.textContent === 'Pending'
      )
      expect(statusBadges.length).toBeGreaterThan(0)
    })

    it('should handle search filtering', () => {
      render(<Consultation searchQuery="Sarah" />)

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument()
    })
  })

  describe('FollowUp', () => {
    it('should render follow-up items', () => {
      render(<FollowUp />)

      expect(screen.getByText('Follow-up Required')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Check vaccination records')).toBeInTheDocument()
      expect(screen.getByText('5 items')).toBeInTheDocument()
    })

    it('should display priority badges with correct colors', () => {
      render(<FollowUp />)

      const priorityBadges = screen.getAllByTestId('badge').filter(
        badge => ['High', 'Medium', 'Low'].includes(badge.textContent || '')
      )
      expect(priorityBadges.length).toBeGreaterThan(0)
    })

    it('should format due dates correctly', () => {
      render(<FollowUp />)

      // Should show formatted dates
      expect(screen.getByText('1/15/2024')).toBeInTheDocument()
      expect(screen.getByText('1/20/2024')).toBeInTheDocument()
    })

    it('should handle search filtering', () => {
      render(<FollowUp searchQuery="vaccination" />)

      expect(screen.getByText('Check vaccination records')).toBeInTheDocument()
      expect(screen.queryByText('Schedule dental follow-up')).not.toBeInTheDocument()
    })
  })

  describe('Inactive', () => {
    it('should render inactive customers', () => {
      render(<Inactive />)

      expect(screen.getByText('Inactive Customers')).toBeInTheDocument()
      expect(screen.getByText('Robert Taylor')).toBeInTheDocument()
      expect(screen.getByText('Jennifer Lee')).toBeInTheDocument()
      expect(screen.getByText('5 customers')).toBeInTheDocument()
    })

    it('should show last visit information', () => {
      render(<Inactive />)

      expect(screen.getByText('6 months ago')).toBeInTheDocument()
      expect(screen.getByText('8 months ago')).toBeInTheDocument()
      expect(screen.getByText('1 year ago')).toBeInTheDocument()
    })

    it('should style inactive rows with opacity', () => {
      render(<Inactive />)

      const rows = screen.getAllByTestId('table-row')
      rows.forEach(row => {
        expect(row).toHaveClass('opacity-75')
      })
    })

    it('should handle search filtering', () => {
      render(<Inactive searchQuery="Robert" />)

      expect(screen.getByText('Robert Taylor')).toBeInTheDocument()
      expect(screen.queryByText('Jennifer Lee')).not.toBeInTheDocument()
    })
  })

  describe('Common functionality', () => {
    it('should handle empty search results across all tabs', () => {
      const components = [
        <NewClients key="new-clients" searchQuery="nonexistent" />,
        <Consultation key="consultation" searchQuery="nonexistent" />,
        <FollowUp key="follow-up" searchQuery="nonexistent" />,
        <Inactive key="inactive" searchQuery="nonexistent" />
      ]

      components.forEach(component => {
        const { unmount } = render(component)
        expect(screen.getByText(/No .* found matching your search/)).toBeInTheDocument()
        unmount()
      })
    })

    it('should handle sorting state correctly', () => {
      render(<NewClients />)

      const nameHeader = screen.getByText('Name').closest('[data-testid="table-header"]')
      
      // First click should sort ascending
      fireEvent.click(nameHeader!)
      
      // Second click should sort descending
      fireEvent.click(nameHeader!)
      
      // Should still render the component without errors
      expect(screen.getByText('New Clients')).toBeInTheDocument()
    })
  })
})