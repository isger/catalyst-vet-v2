import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for tables
type Tenant = Database['public']['Tables']['tenant']['Row']
type TenantMembership = Database['public']['Tables']['tenant_membership']['Row']

export interface TenantWithMembership extends TenantMembership {
  tenant: Tenant
}

export async function getUserTenantData(userId: string): Promise<TenantWithMembership | null> {
  const supabase = await createClient()
  
  // Get user's active tenant membership with tenant data
  const { data, error } = await supabase
    .from('tenant_membership')
    .select(`
      *,
      tenant (*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

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