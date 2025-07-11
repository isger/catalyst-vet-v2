'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithPets, PaginationParams, PaginatedResult } from '@/server/queries/customers'
import { fetchPaginatedCustomers } from '@/server/actions/customers'
import { useRequestCache } from './use-request-cache'
import { useRealtimeCustomers } from './use-realtime-customers'
import type { Database } from '@/types/supabase'

type CustomerRow = Database['public']['Tables']['customer']['Row']

export interface UsePaginatedCustomersOptions extends PaginationParams {
  enableRealtime?: boolean
  tenantId?: string
}

export function usePaginatedCustomers(params: UsePaginatedCustomersOptions) {
  const [data, setData] = useState<PaginatedResult<CustomerWithPets>>({
    data: [],
    total: 0,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { getCached, setCache, getCacheKey } = useRequestCache<PaginatedResult<CustomerWithPets>>(
    'customers',
    30000 // 30 second cache
  )

  const fetchCustomers = useCallback(async (fetchParams: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = getCacheKey(fetchParams)
      const cachedResult = getCached(cacheKey)
      
      if (cachedResult) {
        setData(cachedResult)
        setLoading(false)
        return
      }
      
      const result = await fetchPaginatedCustomers(fetchParams)
      setData(result)
      
      // Cache the result
      setCache(cacheKey, result)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [getCached, setCache, getCacheKey])

  useEffect(() => {
    fetchCustomers(params)
  }, [fetchCustomers, params.page, params.pageSize, params.search, params.sortBy, params.sortOrder])

  const refetch = useCallback(() => {
    fetchCustomers(params)
  }, [fetchCustomers, params])

  // Real-time updates (optional)
  const { enableRealtime = false, tenantId } = params
  
  const handleCustomerAdded = useCallback((customer: CustomerRow) => {
    // Only add if it matches current filters/search
    if (!params.search || 
        customer.name?.toLowerCase().includes(params.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(params.search.toLowerCase()) ||
        customer.phone?.includes(params.search)) {
      setData(prev => ({
        ...prev,
        data: [customer as any, ...prev.data].slice(0, prev.pageSize),
        total: prev.total + 1
      }))
    }
  }, [params.search])

  const handleCustomerUpdated = useCallback((customer: CustomerRow) => {
    setData(prev => ({
      ...prev,
      data: prev.data.map(c => c.id === customer.id ? { ...c, ...customer } : c)
    }))
  }, [])

  const handleCustomerDeleted = useCallback((customerId: string) => {
    setData(prev => ({
      ...prev,
      data: prev.data.filter(c => c.id !== customerId),
      total: Math.max(0, prev.total - 1)
    }))
  }, [])

  useRealtimeCustomers({
    onCustomerAdded: handleCustomerAdded,
    onCustomerUpdated: handleCustomerUpdated,
    onCustomerDeleted: handleCustomerDeleted,
    tenantId,
    enabled: enableRealtime
  })

  return { 
    customers: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    loading, 
    error,
    refetch
  }
}

// Legacy hook for backward compatibility - will be deprecated
export function useActiveCustomers() {
  const [customers, setCustomers] = useState<CustomerWithPets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAllCustomers() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all customers (up to 1000) for backward compatibility
        const result = await fetchPaginatedCustomers({ page: 1, pageSize: 1000 })
        setCustomers(result.data)
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Failed to fetch customers')
      } finally {
        setLoading(false)
      }
    }

    fetchAllCustomers()
  }, [])

  return { customers, loading, error }
}

