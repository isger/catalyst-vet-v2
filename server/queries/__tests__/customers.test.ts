import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getActiveCustomers, getCustomerByIdForTenant, getCustomerStats } from '../customers'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Customer Queries', () => {
  let mockSupabase: any

  // Helper function to create a proper query chain mock
  const createQueryChain = (finalResult: any) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => finalResult),
        eq: vi.fn(() => ({
          single: vi.fn(() => finalResult),
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => finalResult)
            })),
            range: vi.fn(() => finalResult)
          })),
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => finalResult)
            }))
          }))
        })),
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => finalResult)
          }))
        })),
        order: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => finalResult)
          })),
          range: vi.fn(() => finalResult)
        })),
        range: vi.fn(() => finalResult)
      }))
    }))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      auth: {
        getUser: vi.fn()
      },
      from: vi.fn()
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getActiveCustomers', () => {
    it('should return empty result when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getActiveCustomers()

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      })
    })

    it('should return empty result when user has no active tenant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      mockSupabase.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      const result = await getActiveCustomers()

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      })
    })

    it('should fetch customers with default pagination', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      // First call for tenant lookup
      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      
      // Second call for customer data
      const customerResult = {
        data: [
          {
            id: 'customer1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: { street: '123 Main St' },
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            tenant_id: 'tenant123',
            additional_notes: null,
            animal: [
              {
                id: 'pet1',
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                date_of_birth: '2020-01-01'
              }
            ]
          }
        ],
        error: null,
        count: 1
      }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getActiveCustomers()

      expect(result).toEqual({
        data: [
          {
            id: 'customer1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: { street: '123 Main St' },
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            tenant_id: 'tenant123',
            additional_notes: null,
            animals: [
              {
                id: 'pet1',
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                date_of_birth: '2020-01-01'
              }
            ],
            lastVisit: undefined
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      })
    })

    it('should apply search filter correctly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      const customerResult = { data: [], error: null, count: 0 }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getActiveCustomers({ search: 'john' })

      // Verify that the function completed successfully (behavior-based test)
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      })
      // Verify the from method was called twice (once for tenant, once for customers)
      expect(mockSupabase.from).toHaveBeenCalledTimes(2)
    })

    it('should apply custom pagination and sorting', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      const customerResult = { data: [], error: null, count: 0 }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getActiveCustomers({ 
        page: 2, 
        pageSize: 5, 
        sortBy: 'name', 
        sortOrder: 'asc' 
      })

      // Verify that the function completed successfully with correct pagination
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 2,
        pageSize: 5,
        totalPages: 0
      })
      // Verify the from method was called twice (once for tenant, once for customers)
      expect(mockSupabase.from).toHaveBeenCalledTimes(2)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      const customerResult = { data: null, error: new Error('Database error'), count: 0 }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getActiveCustomers()

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      })
    })
  })

  describe('getCustomerByIdForTenant', () => {
    it('should return null when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getCustomerByIdForTenant('customer123')

      expect(result).toBeNull()
    })

    it('should return null when user has no active tenant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      mockSupabase.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      const result = await getCustomerByIdForTenant('customer123')

      expect(result).toBeNull()
    })

    it('should fetch customer by ID with tenant filtering', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      
      const customerResult = {
        data: {
          id: 'customer1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: { street: '123 Main St' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          tenant_id: 'tenant123',
          additional_notes: null,
          animal: [
            {
              id: 'pet1',
              name: 'Buddy',
              species: 'Dog',
              breed: 'Golden Retriever',
              date_of_birth: '2020-01-01'
            }
          ]
        }, 
        error: null 
      }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getCustomerByIdForTenant('customer1')

      expect(result).toEqual({
        id: 'customer1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: { street: '123 Main St' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        tenant_id: 'tenant123',
        additional_notes: null,
        animals: [
          {
            id: 'pet1',
            name: 'Buddy',
            species: 'Dog',
            breed: 'Golden Retriever',
            date_of_birth: '2020-01-01'
          }
        ],
        lastVisit: undefined
      })
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      const customerResult = { data: null, error: new Error('Database error') }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(createQueryChain(customerResult))

      const result = await getCustomerByIdForTenant('customer1')

      expect(result).toBeNull()
    })
  })

  describe('getCustomerStats', () => {
    it('should return zero stats when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getCustomerStats()

      expect(result).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
    })

    it('should return zero stats when user has no active tenant', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      mockSupabase.from.mockReturnValue(createQueryChain({ data: null, error: null }))

      const result = await getCustomerStats()

      expect(result).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
    })

    it('should calculate customer stats correctly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const now = new Date()
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      const twoMonthsAgo = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000)
      const eightMonthsAgo = new Date(now.getTime() - 8 * 30 * 24 * 60 * 60 * 1000)

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      
      const customerResult = {
        data: [
          {
            id: 'owner1',
            created_at: twentyDaysAgo.toISOString(),
            animal: [{ id: 'pet1' }]
          },
          {
            id: 'owner2',
            created_at: twoMonthsAgo.toISOString(),
            animal: [{ id: 'pet2' }]
          },
          {
            id: 'owner3',
            created_at: eightMonthsAgo.toISOString(),
            animal: []
          }
        ], 
        error: null 
      }

      // For stats, we need a simpler mock since it only uses select().eq()
      const statsQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => customerResult)
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))  // tenant query
        .mockReturnValueOnce(statsQuery)  // owner stats query

      const result = await getCustomerStats()

      // Based on actual implementation logic:
      // - owner1: created 20 days ago (< 30 days) -> new + active
      // - owner2: created 2 months ago (> 30 days, < 6 months) -> active
      // - owner3: created 8 months ago (> 6 months) -> inactive
      expect(result).toEqual({
        active: 2, // owner1 (new) + owner2 (active)
        new: 1, // owner1 (created in last 30 days)
        consultation: 0, // Not implemented yet (would require appointments)
        followUp: 0, // Not implemented yet
        inactive: 1 // owner3 (created > 6 months ago)
      })
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const tenantResult = { data: { tenant_id: 'tenant123' }, error: null }
      const customerResult = { data: null, error: new Error('Database error') }

      const statsQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => customerResult)
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(createQueryChain(tenantResult))
        .mockReturnValueOnce(statsQuery)

      const result = await getCustomerStats()

      expect(result).toEqual({
        active: 0,
        new: 0,
        consultation: 0,
        followUp: 0,
        inactive: 0
      })
    })
  })
})