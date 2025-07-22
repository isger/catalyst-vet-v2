'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type TenantMembership = Database['public']['Tables']['tenant_membership']['Row']

export async function getStaffMembers() {
  const supabase = await createClient()
  
  // Get current user's tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: currentMembership } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!currentMembership) return []

  // Get all staff members for this tenant
  const { data, error } = await supabase
    .from('tenant_membership')
    .select(`
      *,
      user:user(
        id,
        email,
        name,
        image
      )
    `)
    .eq('tenant_id', currentMembership.tenant_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function inviteStaffMember(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const role = formData.get('role') as 'admin' | 'member'

  if (!email || !role) {
    throw new Error('Email and role are required')
  }

  // Get current user's tenant and verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: currentMembership } = await supabase
    .from('tenant_membership')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
    throw new Error('Insufficient permissions to invite staff members')
  }

  // Check if email is already a staff member
  const { data: existingStaff } = await supabase
    .from('user')
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
    .from('user')
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