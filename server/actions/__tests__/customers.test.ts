import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPaginatedCustomers } from '../customers'
import { getActiveCustomers } from '@/server/queries/customers'

// Mock the customers query
vi.mock('@/server/queries/customers', () => ({
  getActiveCustomers: vi.fn()
}))

describe('Customer Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPaginatedCustomers', () => {
    it('should call getActiveCustomers with provided params', async () => {
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

      vi.mocked(getActiveCustomers).mockResolvedValue(mockResult)

      const params = {
        page: 2,
        pageSize: 5,
        search: 'john',
        sortBy: 'name',
        sortOrder: 'asc' as const
      }

      const result = await fetchPaginatedCustomers(params)

      expect(getActiveCustomers).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockResult)
    })

    it('should call getActiveCustomers with default params when none provided', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(getActiveCustomers).mockResolvedValue(mockResult)

      const result = await fetchPaginatedCustomers({})

      expect(getActiveCustomers).toHaveBeenCalledWith({})
      expect(result).toEqual(mockResult)
    })

    it('should handle errors from getActiveCustomers', async () => {
      const error = new Error('Database connection failed')
      vi.mocked(getActiveCustomers).mockRejectedValue(error)

      await expect(fetchPaginatedCustomers({})).rejects.toThrow('Database connection failed')
    })

    it('should pass through complex pagination params', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }

      vi.mocked(getActiveCustomers).mockResolvedValue(mockResult)

      const complexParams = {
        page: 3,
        pageSize: 25,
        search: 'veterinary clinic',
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      }

      await fetchPaginatedCustomers(complexParams)

      expect(getActiveCustomers).toHaveBeenCalledWith(complexParams)
    })
  })
})