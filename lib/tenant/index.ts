/**
 * Tenant utilities barrel export
 * Provides all tenant-related functionality in one import
 */

// Subdomain utilities
export {
  getSubdomain,
  hasSubdomain,
  getTenantUrl,
  isValidSubdomain,
  getSubdomainFromRequest,
  isReservedSubdomain,
  RESERVED_SUBDOMAINS
} from './subdomain'

// Tenant resolution
export {
  resolveTenantBySubdomain,
  resolveTenantByDomain,
  resolveTenantByHostname,
  getTenantById,
  checkTenantAccess,
  getUserPrimaryTenant,
  validateTenant
} from './resolver'

// Caching utilities
export {
  getCachedTenant,
  setCachedTenant,
  invalidateTenantCache,
  invalidateAllTenantCache,
  clearExpiredCache,
  clearTenantCache,
  getCacheStats,
  cachedResolveTenantBySubdomain,
  cachedResolveTenantByDomain,
  cachedGetTenantById
} from './cache'

// Re-export types
import type { Database } from '@/types/supabase'
export type { Database }
export type Tenant = Database['public']['Tables']['tenant']['Row']