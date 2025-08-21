'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { getCurrentUserTenant, getCurrentTenantId } from '@/lib/tenant/current-user'
import type { Database } from '@/types/supabase'

type TenantMembership = Database['public']['Tables']['tenant_membership']['Row']

export async function getStaffMembers() {
  console.log('=== getStaffMembers Server Action Debug ===')
  
  const supabase = await createClient()
  
  try {
    // Get current user's tenant using helper (throws if no app_metadata)
    const tenantId = await getCurrentTenantId()
    console.log('Tenant ID from helper:', tenantId)

    // Get all staff members for this tenant
    const { data, error } = await supabase
      .from('tenant_membership')
      .select(`
        *,
        user:profiles!inner(
          id,
          email,
          name,
          image
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    console.log('Staff members query result:', { data, error })
    console.log('Staff members count:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('First staff member:', data[0])
      console.log('All staff member IDs:', data.map(m => m.id))
    }
    
    console.log('===============================================')

    if (error) {
      console.error('Staff members query error:', error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getStaffMembers:', error)
    throw error
  }
}

export async function inviteStaffMember(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const role = formData.get('role') as 'admin' | 'member'

  if (!email || !role) {
    throw new Error('Email and role are required')
  }

  // Get current user's tenant and verify permissions using helper
  const currentMembership = await getCurrentUserTenant()
  if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
    throw new Error('Insufficient permissions to invite staff members')
  }

  // Check if email is already a staff member
  const { data: existingStaff } = await supabase
    .from('profiles')
    .select(`
      id,
      tenant_membership!inner(tenant_id)
    `)
    .eq('email', email)
    .eq('tenant_membership.tenant_id', currentMembership.tenant_id)
    .single()

  if (existingStaff) {
    throw new Error('This person is already a staff member')
  }

  // Look for existing user by email
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    // User exists, add them as staff member
    const { error: membershipError } = await supabase
      .from('tenant_membership')
      .insert({
        tenant_id: currentMembership.tenant_id,
        user_id: existingUser.id,
        role,
        status: 'active'
      })

    if (membershipError) throw membershipError
  } else {
    // TODO: Create invitation system for new users
    throw new Error('User must create an account first. Email invitation system coming soon.')
  }

  revalidateTag('staff-members')
  revalidatePath('/settings')
  
  return { success: true, message: 'Staff member added successfully' }
}

export async function removeStaffMember(membershipId: string) {
  const supabase = await createClient()
  
  // Verify current user has permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: currentMembership } = await supabase
    .from('tenant_membership')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
    throw new Error('Insufficient permissions to remove staff members')
  }

  // Remove the staff member
  const { error } = await supabase
    .from('tenant_membership')
    .delete()
    .eq('id', membershipId)
    .eq('tenant_id', currentMembership.tenant_id) // Extra security check

  if (error) throw error

  revalidateTag('staff-members')
  revalidatePath('/settings')
  
  return { success: true, message: 'Staff member removed successfully' }
}

export async function updateStaffMemberRole(membershipId: string, newRole: 'admin' | 'member') {
  const supabase = await createClient()
  
  // Verify current user is owner (only owners can change roles)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: currentMembership } = await supabase
    .from('tenant_membership')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentMembership || currentMembership.role !== 'owner') {
    throw new Error('Only practice owners can change staff roles')
  }

  const { error } = await supabase
    .from('tenant_membership')
    .update({ role: newRole })
    .eq('id', membershipId)
    .eq('tenant_id', currentMembership.tenant_id) // Extra security check

  if (error) throw error

  revalidateTag('staff-members')
  revalidatePath('/settings')
  
  return { success: true, message: 'Staff member role updated successfully' }
}