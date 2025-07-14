/**
 * Tenant caching utilities for performance optimization
 * In-memory cache with TTL for tenant resolution
 */

import type { Database } from '@/types/supabase'

type Tenant = Database['public']['Tables']['tenant']['Row']

interface CacheEntry {
  tenant: Tenant | null
  timestamp: number
  ttl: number
}

// In-memory cache for tenant resolution
const tenantCache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (30 minutes for better performance)
const DEFAULT_TTL = 30 * 60 * 1000

/**
 * Generate cache key for tenant lookup
 */
function getCacheKey(type: 'subdomain' | 'domain' | 'id', value: string): string {
  return `tenant:${type}:${value}`
}

/**
 * Check if cache entry is valid (not expired)
 */
function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl
}

/**
 * Get tenant from cache
 */
export function getCachedTenant(
  type: 'subdomain' | 'domain' | 'id',
  value: string
): Tenant | null | undefined {
  const key = getCacheKey(type, value)
  const entry = tenantCache.get(key)
  
  if (!entry) {
    return undefined // Cache miss
  }
  
  if (!isValidCacheEntry(entry)) {
    tenantCache.delete(key)
    return undefined // Cache expired
  }
  
  return entry.tenant // Cache hit
}

/**
 * Set tenant in cache
 */
export function setCachedTenant(
  type: 'subdomain' | 'domain' | 'id',
  value: string,
  tenant: Tenant | null,
  ttl: number = DEFAULT_TTL
): void {
  const key = getCacheKey(type, value)
  const entry: CacheEntry = {
    tenant,
    timestamp: Date.now(),
    ttl
  }
  
  tenantCache.set(key, entry)
}

/**
 * Invalidate tenant cache entry
 */
export function invalidateTenantCache(
  type: 'subdomain' | 'domain' | 'id',
  value: string
): void {
  const key = getCacheKey(type, value)
  tenantCache.delete(key)
}

/**
 * Invalidate all cache entries for a tenant
 */
export function invalidateAllTenantCache(tenant: Tenant): void {
  invalidateTenantCache('id', tenant.id)
  invalidateTenantCache('subdomain', tenant.subdomain)
  
  if (tenant.custom_domain) {
    invalidateTenantCache('domain', tenant.custom_domain)
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now()
  
  for (const [key, entry] of tenantCache.entries()) {
    if (now - entry.timestamp >= entry.ttl) {
      tenantCache.delete(key)
    }
  }
}

/**
 * Clear entire tenant cache
 */
export function clearTenantCache(): void {
  tenantCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(tenantCache.values())
  const validEntries = entries.filter(isValidCacheEntry)
  
  return {
    totalEntries: tenantCache.size,
    validEntries: validEntries.length,
    expiredEntries: entries.length - validEntries.length,
    cacheHitRate: validEntries.length / Math.max(entries.length, 1)
  }
}

// Periodic cleanup of expired cache entries (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(clearExpiredCache, 10 * 60 * 1000)
}

/**
 * Cached tenant resolution functions with optimized imports
 */
export async function cachedResolveTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  // Check cache first
  const cached = getCachedTenant('subdomain', subdomain)
  if (cached !== undefined) {
    return cached
  }
  
  // Cache miss - resolve and cache with longer TTL for frequently accessed tenants
  const { resolveTenantBySubdomain } = await import('./resolver')
  const tenant = await resolveTenantBySubdomain(subdomain)
  
  // Use longer TTL for found tenants, shorter for null results
  const cacheTTL = tenant ? DEFAULT_TTL : 5 * 60 * 1000 // 5 min for null results
  setCachedTenant('subdomain', subdomain, tenant, cacheTTL)
  
  return tenant
}

export async function cachedResolveTenantByDomain(domain: string): Promise<Tenant | null> {
  // Check cache first
  const cached = getCachedTenant('domain', domain)
  if (cached !== undefined) {
    return cached
  }
  
  // Cache miss - resolve and cache
  const { resolveTenantByDomain } = await import('./resolver')
  const tenant = await resolveTenantByDomain(domain)
  
  // Use longer TTL for found tenants, shorter for null results
  const cacheTTL = tenant ? DEFAULT_TTL : 5 * 60 * 1000
  setCachedTenant('domain', domain, tenant, cacheTTL)
  
  return tenant
}

export async function cachedGetTenantById(tenantId: string): Promise<Tenant | null> {
  // Check cache first
  const cached = getCachedTenant('id', tenantId)
  if (cached !== undefined) {
    return cached
  }
  
  // Cache miss - resolve and cache
  const { getTenantById } = await import('./resolver')
  const tenant = await getTenantById(tenantId)
  
  setCachedTenant('id', tenantId, tenant)
  
  return tenant
}