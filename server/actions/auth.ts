'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { validateTenant } from '@/lib/tenant/resolver'

export interface SignUpData {
  email: string
  password: string
  fullName?: string
  tenantId?: string
}

export interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()

  // Resolve tenant ID with fallback logic
  let tenantId = data.tenantId
  
  // If no tenant provided, use environment default
  if (!tenantId) {
    tenantId = process.env.DEFAULT_TENANT_ID
  }
  
  // Validate tenant exists
  if (!tenantId) {
    return { error: 'No tenant specified and no default tenant configured' }
  }
  
  const isValidTenant = await validateTenant(tenantId)
  if (!isValidTenant) {
    return { error: 'Invalid tenant specified' }
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      app_metadata: {
        tenant_id: tenantId
      },
      data: {
        full_name: data.fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signIn(data: SignInData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function updateUserTenantId(tenantId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'User not authenticated' }
  }

  // Validate tenant exists
  const isValidTenant = await validateTenant(tenantId)
  if (!isValidTenant) {
    return { error: 'Invalid tenant specified' }
  }

  // Update user's app_metadata using admin client
  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      tenant_id: tenantId
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}