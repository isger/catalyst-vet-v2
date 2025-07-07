import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for tables
type Tenant = Database['public']['Tables']['Tenant']['Row']
type TenantMembership = Database['public']['Tables']['TenantMembership']['Row']

export interface TenantWithMembership {
  tenant: Tenant
  membership: TenantMembership
}

export async function getUserTenantData(userId: string): Promise<TenantWithMembership | null> {
  const supabase = await createClient()
  
  // Get user's active tenant membership with tenant data
  const { data, error } = await supabase
    .from('TenantMembership')
    .select(`
      *,
      Tenant (*)
    `)
    .eq('userId', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching user tenant data:', error)
    return null
  }

  if (!data || !data.Tenant) {
    return null
  }

  return {
    tenant: data.Tenant as Tenant,
    membership: {
      id: data.id,
      userId: data.userId,
      tenantId: data.tenantId,
      role: data.role,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      invitedAt: data.invitedAt,
      invitedBy: data.invitedBy,
      joinedAt: data.joinedAt,
    }
  }
}