'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface PaginationState {
  page: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface PaginationActions {
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSearch: (search: string) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (sortOrder: 'asc' | 'desc') => void
  toggleSort: (column: string) => void
  reset: () => void
}

export interface PaginationReturn extends PaginationState, PaginationActions {
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
}

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  initialSearch?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  total?: number
  useUrlParams?: boolean
}

export function usePagination(options: UsePaginationOptions = {}): PaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSearch = '',
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc',
    total = 0,
    useUrlParams = true
  } = options

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL params if enabled
  const getInitialValue = useCallback((key: string, defaultValue: any) => {
    if (!useUrlParams) return defaultValue
    const urlValue = searchParams.get(key)
    if (!urlValue) return defaultValue
    
    switch (key) {
      case 'page':
      case 'pageSize':
        return parseInt(urlValue, 10) || defaultValue
      case 'sortOrder':
        return urlValue === 'asc' || urlValue === 'desc' ? urlValue : defaultValue
      default:
        return urlValue || defaultValue
    }
  }, [searchParams, useUrlParams])

  const [state, setState] = useState<PaginationState>({
    page: getInitialValue('page', initialPage),
    pageSize: getInitialValue('pageSize', initialPageSize),
    search: getInitialValue('search', initialSearch),
    sortBy: getInitialValue('sortBy', initialSortBy),
    sortOrder: getInitialValue('sortOrder', initialSortOrder)
  })

  // Update URL params when state changes
  const updateUrlParams = useCallback((newState: Partial<PaginationState>) => {
    if (!useUrlParams) return

    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })

    // Always reset to page 1 when search/sort changes
    if ('search' in newState || 'sortBy' in newState || 'sortOrder' in newState) {
      params.set('page', '1')
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams, useUrlParams])

  // Actions
  const setPage = useCallback((page: number) => {
    const newState = { ...state, page }
    setState(newState)
    updateUrlParams({ page })
  }, [state, updateUrlParams])

  const setPageSize = useCallback((pageSize: number) => {
    const newState = { ...state, pageSize, page: 1 }
    setState(newState)
    updateUrlParams({ pageSize, page: 1 })
  }, [state, updateUrlParams])

  const setSearch = useCallback((search: string) => {
    const newState = { ...state, search, page: 1 }
    setState(newState)
    updateUrlParams({ search, page: 1 })
  }, [state, updateUrlParams])

  const setSortBy = useCallback((sortBy: string) => {
    const newState = { ...state, sortBy, page: 1 }
    setState(newState)
    updateUrlParams({ sortBy, page: 1 })
  }, [state, updateUrlParams])

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    const newState = { ...state, sortOrder, page: 1 }
    setState(newState)
    updateUrlParams({ sortOrder, page: 1 })
  }, [state, updateUrlParams])

  const toggleSort = useCallback((column: string) => {
    if (state.sortBy === column) {
      // Toggle order for same column
      setSortOrder(state.sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column with default desc order
      setSortBy(column)
      setSortOrder('desc')
    }
  }, [state.sortBy, state.sortOrder, setSortBy, setSortOrder])

  const reset = useCallback(() => {
    const newState = {
      page: initialPage,
      pageSize: initialPageSize,
      search: initialSearch,
      sortBy: initialSortBy,
      sortOrder: initialSortOrder
    }
    setState(newState)
    updateUrlParams(newState)
  }, [initialPage, initialPageSize, initialSearch, initialSortBy, initialSortOrder, updateUrlParams])

  // Computed values
  const totalPages = useMemo(() => Math.ceil(total / state.pageSize), [total, state.pageSize])
  const hasNextPage = useMemo(() => state.page < totalPages, [state.page, totalPages])
  const hasPreviousPage = useMemo(() => state.page > 1, [state.page])

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(state.page + 1)
  }, [hasNextPage, setPage, state.page])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) setPage(state.page - 1)
  }, [hasPreviousPage, setPage, state.page])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) setPage(page)
  }, [setPage, totalPages])

  return {
    ...state,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    toggleSort,
    reset,
    nextPage,
    previousPage,
    goToPage
  }
}