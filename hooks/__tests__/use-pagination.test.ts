import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../use-pagination'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => mockSearchParams
}))

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.forEach((value, key) => {
      mockSearchParams.delete(key)
    })
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.search).toBe('')
      expect(result.current.sortBy).toBe('createdAt')
      expect(result.current.sortOrder).toBe('desc')
      expect(result.current.totalPages).toBe(0)
      expect(result.current.hasNextPage).toBe(false)
      expect(result.current.hasPreviousPage).toBe(false)
    })

    it('should initialize with custom options', () => {
      const options = {
        initialPage: 3,
        initialPageSize: 25,
        initialSearch: 'test',
        initialSortBy: 'name',
        initialSortOrder: 'asc' as const,
        total: 100
      }

      const { result } = renderHook(() => usePagination(options))

      expect(result.current.page).toBe(3)
      expect(result.current.pageSize).toBe(25)
      expect(result.current.search).toBe('test')
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('asc')
      expect(result.current.totalPages).toBe(4) // 100 / 25 = 4
    })

    it('should initialize from URL parameters when useUrlParams is true', () => {
      mockSearchParams.set('page', '2')
      mockSearchParams.set('pageSize', '20')
      mockSearchParams.set('search', 'john')
      mockSearchParams.set('sortBy', 'email')
      mockSearchParams.set('sortOrder', 'asc')

      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      expect(result.current.page).toBe(2)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.search).toBe('john')
      expect(result.current.sortBy).toBe('email')
      expect(result.current.sortOrder).toBe('asc')
    })

    it('should ignore URL parameters when useUrlParams is false', () => {
      mockSearchParams.set('page', '5')
      mockSearchParams.set('pageSize', '50')

      const { result } = renderHook(() => usePagination({ useUrlParams: false }))

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
    })

    it('should handle invalid URL parameters gracefully', () => {
      mockSearchParams.set('page', 'invalid')
      mockSearchParams.set('pageSize', 'not-a-number')
      mockSearchParams.set('sortOrder', 'invalid')

      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.sortOrder).toBe('desc')
    })
  })

  describe('computed values', () => {
    it('should calculate totalPages correctly', () => {
      const { result } = renderHook(() => usePagination({ total: 97, initialPageSize: 10 }))
      expect(result.current.totalPages).toBe(10) // Math.ceil(97 / 10) = 10
    })

    it('should calculate hasNextPage correctly', () => {
      const { result } = renderHook(() => usePagination({ total: 30, initialPageSize: 10, initialPage: 2 }))
      expect(result.current.hasNextPage).toBe(true) // Page 2 of 3
    })

    it('should calculate hasPreviousPage correctly', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))
      expect(result.current.hasPreviousPage).toBe(true) // Page 3 > 1
    })

    it('should handle edge cases for navigation', () => {
      const { result } = renderHook(() => usePagination({ total: 10, initialPageSize: 10, initialPage: 1 }))
      expect(result.current.hasNextPage).toBe(false) // Only 1 page
      expect(result.current.hasPreviousPage).toBe(false) // First page
    })
  })

  describe('page navigation', () => {
    it('should set page and update URL', () => {
      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      act(() => {
        result.current.setPage(3)
      })

      expect(result.current.page).toBe(3)
      expect(mockPush).toHaveBeenCalledWith('?page=3', { scroll: false })
    })

    it('should go to next page', () => {
      const { result } = renderHook(() => usePagination({ 
        total: 100, 
        initialPageSize: 10, 
        initialPage: 2,
        useUrlParams: true
      }))

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(3)
      expect(mockPush).toHaveBeenCalledWith('?page=3', { scroll: false })
    })

    it('should not go beyond last page', () => {
      const { result } = renderHook(() => usePagination({ 
        total: 20, 
        initialPageSize: 10, 
        initialPage: 2,
        useUrlParams: true
      }))

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(2) // Should stay at 2
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should go to previous page', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 3,
        useUrlParams: true
      }))

      act(() => {
        result.current.previousPage()
      })

      expect(result.current.page).toBe(2)
      expect(mockPush).toHaveBeenCalledWith('?page=2', { scroll: false })
    })

    it('should not go below first page', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 1,
        useUrlParams: true
      }))

      act(() => {
        result.current.previousPage()
      })

      expect(result.current.page).toBe(1) // Should stay at 1
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should go to specific page', () => {
      const { result } = renderHook(() => usePagination({ 
        total: 100, 
        initialPageSize: 10,
        useUrlParams: true
      }))

      act(() => {
        result.current.goToPage(5)
      })

      expect(result.current.page).toBe(5)
      expect(mockPush).toHaveBeenCalledWith('?page=5', { scroll: false })
    })

    it('should not go to invalid page numbers', () => {
      const { result } = renderHook(() => usePagination({ 
        total: 30, 
        initialPageSize: 10,
        useUrlParams: true
      }))

      act(() => {
        result.current.goToPage(0) // Invalid
      })

      expect(result.current.page).toBe(1) // Should stay at 1
      expect(mockPush).not.toHaveBeenCalled()

      act(() => {
        result.current.goToPage(5) // Beyond total pages
      })

      expect(result.current.page).toBe(1) // Should stay at 1
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('page size changes', () => {
    it('should set page size and reset to page 1', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 3,
        useUrlParams: true
      }))

      act(() => {
        result.current.setPageSize(25)
      })

      expect(result.current.pageSize).toBe(25)
      expect(result.current.page).toBe(1) // Reset to first page
      expect(mockPush).toHaveBeenCalledWith('?pageSize=25&page=1', { scroll: false })
    })
  })

  describe('search functionality', () => {
    it('should set search and reset to page 1', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 3,
        useUrlParams: true
      }))

      act(() => {
        result.current.setSearch('john')
      })

      expect(result.current.search).toBe('john')
      expect(result.current.page).toBe(1) // Reset to first page
      expect(mockPush).toHaveBeenCalledWith('?search=john&page=1', { scroll: false })
    })

    it('should clear search when empty string', () => {
      mockSearchParams.set('search', 'existing')
      
      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      act(() => {
        result.current.setSearch('')
      })

      expect(result.current.search).toBe('')
      expect(mockPush).toHaveBeenCalledWith('?page=1', { scroll: false })
    })
  })

  describe('sorting functionality', () => {
    it('should set sort by and reset to page 1', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 3,
        useUrlParams: true
      }))

      act(() => {
        result.current.setSortBy('name')
      })

      expect(result.current.sortBy).toBe('name')
      expect(result.current.page).toBe(1) // Reset to first page
      expect(mockPush).toHaveBeenCalledWith('?sortBy=name&page=1', { scroll: false })
    })

    it('should set sort order and reset to page 1', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 3,
        useUrlParams: true
      }))

      act(() => {
        result.current.setSortOrder('asc')
      })

      expect(result.current.sortOrder).toBe('asc')
      expect(result.current.page).toBe(1) // Reset to first page
      expect(mockPush).toHaveBeenCalledWith('?sortOrder=asc&page=1', { scroll: false })
    })

    it('should toggle sort order for same column', () => {
      const { result } = renderHook(() => usePagination({ 
        initialSortBy: 'name',
        initialSortOrder: 'asc',
        useUrlParams: true
      }))

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('desc')
      expect(mockPush).toHaveBeenCalledWith('?sortBy=name&sortOrder=desc&page=1', { scroll: false })
    })

    it('should set new column with default desc order', () => {
      const { result } = renderHook(() => usePagination({ 
        initialSortBy: 'name',
        initialSortOrder: 'asc',
        useUrlParams: true
      }))

      act(() => {
        result.current.toggleSort('email')
      })

      expect(result.current.sortBy).toBe('email')
      expect(result.current.sortOrder).toBe('desc')
      expect(mockPush).toHaveBeenCalledWith('?sortBy=email&sortOrder=desc&page=1', { scroll: false })
    })
  })

  describe('reset functionality', () => {
    it('should reset to initial values', () => {
      const { result } = renderHook(() => usePagination({ 
        initialPage: 2,
        initialPageSize: 20,
        initialSearch: 'test',
        initialSortBy: 'name',
        initialSortOrder: 'asc',
        useUrlParams: true
      }))

      // Change some values
      act(() => {
        result.current.setPage(5)
        result.current.setSearch('different')
        result.current.setSortBy('email')
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.page).toBe(2)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.search).toBe('test')
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('asc')
      expect(mockPush).toHaveBeenLastCalledWith('?page=2&pageSize=20&search=test&sortBy=name&sortOrder=asc', { scroll: false })
    })
  })

  describe('URL parameter handling', () => {
    it('should not update URL when useUrlParams is false', () => {
      const { result } = renderHook(() => usePagination({ useUrlParams: false }))

      act(() => {
        result.current.setPage(3)
        result.current.setSearch('test')
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle complex URL updates', () => {
      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      act(() => {
        result.current.setPage(2)
        result.current.setPageSize(25)
        result.current.setSearch('john')
        result.current.setSortBy('email')
        result.current.setSortOrder('asc')
      })

      // Should have been called multiple times with cumulative updates
      expect(mockPush).toHaveBeenCalled()
    })

    it('should remove empty parameters from URL', () => {
      mockSearchParams.set('search', 'existing')
      
      const { result } = renderHook(() => usePagination({ useUrlParams: true }))

      act(() => {
        result.current.setSearch('')
      })

      // Should remove search parameter when empty
      expect(mockPush).toHaveBeenCalledWith('?page=1', { scroll: false })
    })
  })
})