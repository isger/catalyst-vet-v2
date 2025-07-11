'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchPaginatedAnimals } from '@/server/queries/animals'
import type { PaginatedAnimalsResult, AnimalWithOwner } from '@/server/queries/animals'
import { useRealtimeAnimals } from './use-realtime-animals'
import type { Database } from '@/types/supabase'

type AnimalRow = Database['public']['Tables']['animal']['Row']

export interface UseAnimalsOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  initialData?: PaginatedAnimalsResult
  enableRealtime?: boolean
  tenantId?: string
  ownerId?: string
}

export interface UseAnimalsResult {
  animals: AnimalWithOwner[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateFilters: (filters: Partial<UseAnimalsOptions>) => void
}

export function useAnimals(options: UseAnimalsOptions = {}): UseAnimalsResult {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    initialData,
    enableRealtime = false,
    tenantId,
    ownerId
  } = options

  const [state, setState] = useState<{
    animals: AnimalWithOwner[]
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    loading: boolean
    error: string | null
  }>({
    animals: initialData?.animals || [],
    totalCount: initialData?.totalCount || 0,
    totalPages: initialData?.totalPages || 0,
    currentPage: initialData?.currentPage || page,
    pageSize: initialData?.pageSize || pageSize,
    loading: false,
    error: null
  })

  const [filters, setFilters] = useState({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder
  })

  // Fetch animals data
  const fetchAnimals = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await fetchPaginatedAnimals({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      setState(prev => ({
        ...prev,
        animals: result.animals,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        loading: false
      }))
    } catch (error) {
      console.error('Error fetching animals:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching animals'
      }))
    }
  }, [filters])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UseAnimalsOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when search or sort changes
      page: newFilters.search !== undefined || newFilters.sortBy !== undefined || newFilters.sortOrder !== undefined 
        ? 1 
        : newFilters.page !== undefined 
          ? newFilters.page 
          : prev.page
    }))
  }, [])

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchAnimals()
  }, [fetchAnimals])

  // Real-time updates (optional)
  const handleAnimalAdded = useCallback((animal: AnimalRow) => {
    // Only add if it matches current filters/search
    if (!search || 
        animal.name?.toLowerCase().includes(search.toLowerCase()) ||
        animal.species?.toLowerCase().includes(search.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(search.toLowerCase())) {
      setState(prev => ({
        ...prev,
        animals: [animal as any, ...prev.animals].slice(0, prev.pageSize),
        totalCount: prev.totalCount + 1
      }))
    }
  }, [search])

  const handleAnimalUpdated = useCallback((animal: AnimalRow) => {
    setState(prev => ({
      ...prev,
      animals: prev.animals.map(a => a.id === animal.id ? { ...a, ...animal } : a)
    }))
  }, [])

  const handleAnimalDeleted = useCallback((animalId: string) => {
    setState(prev => ({
      ...prev,
      animals: prev.animals.filter(a => a.id !== animalId),
      totalCount: Math.max(0, prev.totalCount - 1)
    }))
  }, [])

  useRealtimeAnimals({
    onAnimalAdded: handleAnimalAdded,
    onAnimalUpdated: handleAnimalUpdated,
    onAnimalDeleted: handleAnimalDeleted,
    ownerId,
    tenantId,
    enabled: enableRealtime
  })

  // Fetch data when filters change
  useEffect(() => {
    // Don't fetch if we have initial data and filters haven't changed
    if (initialData && 
        filters.page === page && 
        filters.pageSize === pageSize &&
        filters.search === search &&
        filters.sortBy === sortBy &&
        filters.sortOrder === sortOrder) {
      return
    }
    
    fetchAnimals()
  }, [filters, fetchAnimals, initialData, page, pageSize, search, sortBy, sortOrder])

  return {
    animals: state.animals,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    loading: state.loading,
    error: state.error,
    refresh,
    updateFilters
  }
}

// Hook for getting a single animal by ID
export function useAnimal(id: string | null) {
  const [animal, setAnimal] = useState<AnimalWithOwner | null>(null)
  const [loading, setLoading] = useState<boolean>(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setAnimal(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchAnimal = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Note: We need to create a client-side version of getAnimalById
        // or use a different approach for client-side data fetching
        // For now, we'll use a simplified approach
        const response = await fetch(`/api/animals/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch animal: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAnimal(data)
      } catch (error) {
        console.error('Error fetching animal:', error)
        setError(error instanceof Error ? error.message : 'An error occurred while fetching the animal')
        setAnimal(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimal()
  }, [id])

  const refresh = useCallback(async () => {
    if (id) {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/animals/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch animal: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAnimal(data)
      } catch (error) {
        console.error('Error fetching animal:', error)
        setError(error instanceof Error ? error.message : 'An error occurred while fetching the animal')
        setAnimal(null)
      } finally {
        setLoading(false)
      }
    }
  }, [id])

  return {
    animal,
    loading,
    error,
    refresh
  }
}

// Hook for getting animals by owner
export function useAnimalsByOwner(ownerId: string | null) {
  const [animals, setAnimals] = useState<AnimalWithOwner[]>([])
  const [loading, setLoading] = useState<boolean>(!!ownerId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerId) {
      setAnimals([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchAnimals = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/animals/by-owner/${ownerId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch animals: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAnimals(data)
      } catch (error) {
        console.error('Error fetching animals by owner:', error)
        setError(error instanceof Error ? error.message : 'An error occurred while fetching animals')
        setAnimals([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [ownerId])

  const refresh = useCallback(async () => {
    if (ownerId) {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/animals/by-owner/${ownerId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch animals: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAnimals(data)
      } catch (error) {
        console.error('Error fetching animals by owner:', error)
        setError(error instanceof Error ? error.message : 'An error occurred while fetching animals')
        setAnimals([])
      } finally {
        setLoading(false)
      }
    }
  }, [ownerId])

  return {
    animals,
    loading,
    error,
    refresh
  }
}

// Hook compatible with customer pagination pattern
export function usePaginatedAnimals(params: {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { animals, totalCount, totalPages, currentPage, pageSize, loading, error, refresh } = useAnimals({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })

  return {
    animals,
    total: totalCount,
    page: currentPage,
    pageSize,
    totalPages,
    loading,
    error,
    refetch: refresh
  }
}

// Hook for animal statistics
export function useAnimalStats() {
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalSpecies: 0,
    recentAnimals: 0,
    averageAge: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/animals/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching animal stats:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while fetching statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}