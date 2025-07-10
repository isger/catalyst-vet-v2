import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getActiveCustomers, getCustomerByIdForTenant, getCustomerStats } from '../customers'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Customer Queries', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: null })),
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => ({ data: [], error: null, count: 0 }))
              }))
            }))
          }))
        })),
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({ data: [], error: null, count: 0 }))
          }))
        })),
        order: vi.fn(() => ({
          range: vi.fn(() => ({ data: [], error: null, count: 0 }))
        })),
        range: vi.fn(() => ({ data: [], error: null, count: 0 }))
      }))
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
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

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null }))
            }))
          }))
        }))
      }
      mockSupabase.from.mockReturnValue(mockTenantQuery)

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

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({ 
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
                    patient: [
                      {
                        id: 'pet1',
                        name: 'Buddy',
                        species: 'Dog',
                        breed: 'Golden Retriever',
                        dateOfBirth: '2020-01-01',
                        appointment: [
                          {
                            scheduledAt: '2023-12-01T10:00:00Z',
                            status: 'completed'
                          }
                        ]
                      }
                    ]
                  }
                ],
                error: null,
                count: 1
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

      const result = await getActiveCustomers()

      expect(result).toEqual({
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

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => ({ 
                  data: [], 
                  error: null, 
                  count: 0 
                }))
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

      await getActiveCustomers({ search: 'john' })

      expect(mockCustomerQuery.select().eq().or).toHaveBeenCalledWith(
        'firstName.ilike.%john%,lastName.ilike.%john%,email.ilike.%john%'
      )
    })

    it('should apply custom pagination and sorting', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({ 
                data: [], 
                error: null, 
                count: 0 
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

      await getActiveCustomers({ 
        page: 2, 
        pageSize: 5, 
        sortBy: 'name', 
        sortOrder: 'asc' 
      })

      expect(mockCustomerQuery.select().eq().order).toHaveBeenCalledWith('firstName', { ascending: true })
      expect(mockCustomerQuery.select().eq().order().range).toHaveBeenCalledWith(5, 9)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({ 
                data: null, 
                error: new Error('Database error'), 
                count: 0 
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

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

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null }))
            }))
          }))
        }))
      }
      mockSupabase.from.mockReturnValue(mockTenantQuery)

      const result = await getCustomerByIdForTenant('customer123')

      expect(result).toBeNull()
    })

    it('should fetch customer by ID with tenant filtering', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: {
                  id: 'customer1',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                  phone: '1234567890',
                  address: { street: '123 Main St' },
                  createdAt: '2023-01-01T00:00:00Z',
                  updatedAt: '2023-01-01T00:00:00Z',
                  tenantId: 'tenant123',
                  Patient: [
                    {
                      id: 'pet1',
                      name: 'Buddy',
                      species: 'Dog',
                      breed: 'Golden Retriever',
                      dateOfBirth: '2020-01-01',
                      Appointment: [
                        {
                          scheduledAt: '2023-12-01T10:00:00Z',
                          status: 'completed'
                        }
                      ]
                    }
                  ]
                }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

      const result = await getCustomerByIdForTenant('customer1')

      expect(result).toEqual({
        id: 'customer1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
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
      })

      expect(mockCustomerQuery.select().eq().eq().single).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: null, 
                error: new Error('Database error') 
              }))
            }))
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

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

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null }))
            }))
          }))
        }))
      }
      mockSupabase.from.mockReturnValue(mockTenantQuery)

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
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ 
            data: [
              {
                id: 'owner1',
                createdAt: twentyDaysAgo.toISOString(),
                patient: [
                  {
                    id: 'pet1',
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
                    id: 'pet2',
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
            ], 
            error: null 
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

      const result = await getCustomerStats()

      expect(result).toEqual({
        active: 2, // owner1 (recent appointment) + owner2 (upcoming appointment)
        new: 1, // owner1 (created in last 30 days)
        consultation: 1, // owner2 (has upcoming appointment)
        followUp: 0, // Not implemented yet
        inactive: 1 // owner3 (no activity, created > 6 months ago)
      })
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'user123' } } 
      })

      const mockTenantQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ 
                data: { tenantId: 'tenant123' }, 
                error: null 
              }))
            }))
          }))
        }))
      }

      const mockCustomerQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ 
            data: null, 
            error: new Error('Database error') 
          }))
        }))
      }

      mockSupabase.from
        .mockReturnValueOnce(mockTenantQuery)
        .mockReturnValueOnce(mockCustomerQuery)

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