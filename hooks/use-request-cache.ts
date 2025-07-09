'use client'

import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

export function useRequestCache<T>(cacheKey: string, ttl: number = 60000) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())

  const getCached = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now > entry.expiry) {
      cache.current.delete(key)
      return null
    }
    
    return entry.data
  }, [])

  const setCache = useCallback((key: string, data: T): void => {
    const now = Date.now()
    cache.current.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl
    })
  }, [ttl])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  const getCacheKey = useCallback((params: Record<string, any>): string => {
    return `${cacheKey}:${JSON.stringify(params)}`
  }, [cacheKey])

  return {
    getCached,
    setCache,
    clearCache,
    getCacheKey
  }
}