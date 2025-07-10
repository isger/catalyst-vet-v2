import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePaginatedCustomers, useActiveCustomers, useCustomerStats } from '../use-customers'
import { fetchPaginatedCustomers } from '@/server/actions/customers'
import { createClient } from '@/lib/supabase/client'

// Mock the server actions
vi.mock('@/server/actions/customers', () => ({
  fetchPaginatedCustomers: vi.fn()
}))

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn()
}))

describe('useCustomers hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePaginatedCustomers', () => {
    it('should initialize with default values', () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue(mockResult)

      const { result } = renderHook(() => usePaginatedCustomers({ page: 1, pageSize: 10 }))

      expect(result.current.customers).toEqual([])
      expect(result.current.total).toBe(0)
      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.totalPages).toBe(0)
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should fetch customers on mount', async () => {
      const mockResult = {
        data: [
          {
            id: 'customer1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: { street: '123 Main St' },
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            tenantId: 'tenant123',
            patients: [],
            lastVisit: undefined
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      }

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue(mockResult)

      const params = { page: 1, pageSize: 10 }
      const { result } = renderHook(() => usePaginatedCustomers(params))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchPaginatedCustomers).toHaveBeenCalledWith(params)
      expect(result.current.customers).toEqual(mockResult.data)
      expect(result.current.total).toBe(1)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      vi.mocked(fetchPaginatedCustomers).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => usePaginatedCustomers({ page: 1, pageSize: 10 }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch customers')
      expect(result.current.customers).toEqual([])
    })

    it('should refetch when params change', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue(mockResult)

      const initialParams = { page: 1, pageSize: 10 }
      const { result, rerender } = renderHook(
        ({ params }) => usePaginatedCustomers(params),
        { initialProps: { params: initialParams } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchPaginatedCustomers).toHaveBeenCalledTimes(1)

      // Change params
      const newParams = { page: 2, pageSize: 10 }
      rerender({ params: newParams })

      await waitFor(() => {
        expect(fetchPaginatedCustomers).toHaveBeenCalledTimes(2)
      })

      expect(fetchPaginatedCustomers).toHaveBeenLastCalledWith(newParams)
    })

    it('should provide refetch function', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue(mockResult)

      const params = { page: 1, pageSize: 10 }
      const { result } = renderHook(() => usePaginatedCustomers(params))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchPaginatedCustomers).toHaveBeenCalledTimes(1)

      // Call refetch
      result.current.refetch()

      await waitFor(() => {
        expect(fetchPaginatedCustomers).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle search parameter updates', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue(mockResult)

      const initialParams = { page: 1, pageSize: 10, search: '' }
      const { result, rerender } = renderHook(
        ({ params }) => usePaginatedCustomers(params),
        { initialProps: { params: initialParams } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change search
      const newParams = { page: 1, pageSize: 10, search: 'john' }
      rerender({ params: newParams })

      await waitFor(() => {
        expect(fetchPaginatedCustomers).toHaveBeenCalledTimes(2)
      })

      expect(fetchPaginatedCustomers).toHaveBeenLastCalledWith(newParams)
    })
  })

  describe('useActiveCustomers', () => {
    it('should initialize with default values', () => {
      vi.mocked(fetchPaginatedCustomers).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 1000,
        totalPages: 0
      })

      const { result } = renderHook(() => useActiveCustomers())

      expect(result.current.customers).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should fetch all customers with large page size', async () => {
      const mockCustomers = [
        {
          id: 'customer1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: { street: '123 Main St' },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          tenantId: 'tenant123',
          patients: [],
          lastVisit: undefined
        }
      ]

      vi.mocked(fetchPaginatedCustomers).mockResolvedValue({
        data: mockCustomers,
        total: 1,
        page: 1,
        pageSize: 1000,
        totalPages: 1
      })

      const { result } = renderHook(() => useActiveCustomers())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchPaginatedCustomers).toHaveBeenCalledWith({ page: 1, pageSize: 1000 })
      expect(result.current.customers).toEqual(mockCustomers)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      vi.mocked(fetchPaginatedCustomers).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useActiveCustomers())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch customers')
      expect(result.current.customers).toEqual([])
    })
  })

  describe('useCustomerStats', () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ data: [], error: null }))
      }))
    }

    beforeEach(() => {
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)
    })

    it('should initialize with default stats', () => {
      const { result } = renderHook(() => useCustomerStats())

      expect(result.current.stats).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should fetch and calculate stats correctly', async () => {
      const now = new Date()
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      const twoMonthsAgo = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000)
      const eightMonthsAgo = new Date(now.getTime() - 8 * 30 * 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const mockCustomers = [
        {
          id: 'owner1',
          createdAt: twentyDaysAgo.toISOString(),
          patient: [
            {
              appointment: [
                {
                  status: 'completed',
                  scheduledAt: twentyDaysAgo.toISOString()
                }
              ]
            }
          ]
        },
        {
          id: 'owner2',
          createdAt: twoMonthsAgo.toISOString(),
          patient: [
            {
              appointment: [
                {
                  status: 'scheduled',
                  scheduledAt: tomorrow.toISOString()
                }
              ]
            }
          ]
        },
        {
          id: 'owner3',
          createdAt: eightMonthsAgo.toISOString(),
          patient: []
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({ data: mockCustomers, error: null }))
      })

      const { result } = renderHook(() => useCustomerStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toEqual({
        active: 2, // owner1 (recent) + owner2 (upcoming)
        new: 1, // owner1 (created in last 30 days)
        consultation: 1, // owner2 (has upcoming appointment)
        followUp: 0, // Not implemented
        inactive: 1 // owner3 (no activity, created > 6 months ago)
      })
      expect(result.current.error).toBeNull()
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({ data: null, error: new Error('Database error') }))
      })

      const { result } = renderHook(() => useCustomerStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch stats')
      expect(result.current.stats).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
    })

    it('should handle empty data response', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({ data: null, error: null }))
      })

      const { result } = renderHook(() => useCustomerStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
      expect(result.current.error).toBeNull()
    })

    it('should handle customers with no patients', async () => {
      const mockCustomers = [
        {
          id: 'owner1',
          createdAt: new Date().toISOString(),
          patient: null
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({ data: mockCustomers, error: null }))
      })

      const { result } = renderHook(() => useCustomerStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toEqual({
        active: 0,
        new: 1, // Created recently
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
    })
  })
})