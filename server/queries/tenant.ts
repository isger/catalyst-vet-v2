import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for tables
type Tenant = Database['public']['Tables']['tenant']['Row']
type TenantMembership = Database['public']['Tables']['tenant_membership']['Row']

export interface TenantWithMembership extends TenantMembership {
  tenant: Tenant
}

export async function getUserTenantData(userId: string, tenantId?: string): Promise<TenantWithMembership | null> {
  const supabase = await createClient()
  
  // Get user's active tenant membership with tenant data
  let query = supabase
    .from('tenant_membership')
    .select(`
      *,
      tenant (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
  
  // If tenantId is provided, filter by specific tenant
  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }
  
  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Error fetching user tenant data:', error)
    return null
  }

  if (!data || !data.tenant) {
    return null
  }

  return {
    ...data,
    tenant: data.tenant as Tenant,
  } as TenantWithMembership
}