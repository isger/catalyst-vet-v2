import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type TenantMembership = Database['public']['Tables']['tenant_membership']['Row']
type Tenant = Database['public']['Tables']['tenant']['Row']

export interface CurrentUserTenant extends TenantMembership {
  tenant: Tenant
}

/**
 * Get current user's tenant membership with caching
 * REQUIRES app_metadata.tenant_id - no legacy fallbacks
 * Cached per request to avoid duplicate queries
 */
export const getCurrentUserTenant = cache(async (): Promise<CurrentUserTenant | null> => {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return null
  }

  // Require tenant_id in app_metadata
  const tenantId = user.app_metadata?.tenant_id
  if (!tenantId) {
    throw new Error('User account not properly configured. Please contact support to set up your tenant access.')
  }
  
  // Get membership data for this tenant
  const { data: membership, error } = await supabase
    .from('tenant_membership')
    .select(`
      *,
      tenant:tenant(*)
    `)
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .single()

  if (error || !membership || !membership.tenant) {
    throw new Error(`Invalid tenant access for tenant ${tenantId}. Please contact support.`)
  }

  return {
    ...membership,
    tenant: membership.tenant as Tenant,
  } as CurrentUserTenant
})

/**
 * Get current tenant ID from app_metadata
 * REQUIRES app_metadata.tenant_id - no fallbacks
 */
export const getCurrentTenantId = cache(async (): Promise<string> => {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Require tenant_id in app_metadata
  const tenantId = user.app_metadata?.tenant_id
  if (!tenantId) {
    throw new Error('User account not properly configured. Please contact support to set up your tenant access.')
  }

  return tenantId
})

/**
 * Check if current user has access to a specific tenant
 */
export const hasAccessToTenant = cache(async (tenantId: string): Promise<boolean> => {
  try {
    const currentTenantId = await getCurrentTenantId()
    return currentTenantId === tenantId
  } catch {
    return false
  }
})

/**
 * Get current user's role in their tenant
 */
export const getCurrentUserRole = cache(async (): Promise<string> => {
  const membership = await getCurrentUserTenant()
  return membership?.role || 'user'
})