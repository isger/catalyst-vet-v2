/**
 * Tenant resolution utilities for multi-tenant routing
 * Resolves tenant by subdomain or custom domain
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type Tenant = Database['public']['Tables']['tenant']['Row']

/**
 * Resolve tenant by subdomain
 */
export async function resolveTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant')
      .select('*')
      .eq('subdomain', subdomain)
      .single()
    
    if (error || !data) {
      console.warn(`Tenant not found for subdomain: ${subdomain}`, error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error resolving tenant by subdomain:', error)
    return null
  }
}

/**
 * Resolve tenant by custom domain
 */
export async function resolveTenantByDomain(domain: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant')
      .select('*')
      .eq('custom_domain', domain)
      .single()
    
    if (error || !data) {
      console.warn(`Tenant not found for domain: ${domain}`, error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error resolving tenant by domain:', error)
    return null
  }
}

/**
 * Resolve tenant by hostname (subdomain or custom domain)
 */
export async function resolveTenantByHostname(hostname: string): Promise<Tenant | null> {
  // Clean hostname
  const cleanHostname = hostname.replace(/^https?:\/\//, '').replace(/:\d+$/, '')
  
  // First try custom domain
  const tenantByDomain = await resolveTenantByDomain(cleanHostname)
  if (tenantByDomain) {
    return tenantByDomain
  }
  
  // Then try subdomain
  const { getSubdomain } = await import('./subdomain')
  const subdomain = getSubdomain(hostname)
  
  if (!subdomain) {
    return null
  }
  
  return await resolveTenantBySubdomain(subdomain)
}

/**
 * Get tenant by ID (fallback method)
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant')
      .select('*')
      .eq('id', tenantId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting tenant by ID:', error)
    return null
  }
}

/**
 * Check if user has access to tenant
 */
export async function checkTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant_membership')
      .select('id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error checking tenant access:', error)
    return false
  }
}

/**
 * Get user's primary tenant (first active membership)
 */
export async function getUserPrimaryTenant(userId: string): Promise<Tenant | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant_membership')
      .select(`
        tenant:tenant_id (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    
    if (error || !data || !data.tenant) {
      return null
    }
    
    return data.tenant as Tenant
  } catch (error) {
    console.error('Error getting user primary tenant:', error)
    return null
  }
}

/**
 * Validate tenant exists and is active
 */
export async function validateTenant(tenantId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('tenant')
      .select('id')
      .eq('id', tenantId)
      .single()
    
    return !error && !!data
  } catch (error) {
    console.error('Error validating tenant:', error)
    return false
  }
}