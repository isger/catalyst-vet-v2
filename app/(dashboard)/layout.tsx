import { getQuickActions } from '@/data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import { ApplicationLayout } from './application-layout'
import { getUserTenantData } from '@/server/queries/tenant'
import { getTenantById, checkTenantAccess } from '@/lib/tenant/resolver'
import { TenantProvider } from '@/components/providers/tenant-provider'
import { AnimalSearchProvider } from '@/components/features/animals/AnimalSearchProvider'
import type { Database } from '@/types/supabase'

type Tenant = Database['public']['Tables']['tenant']['Row']
type Membership = {
  id: string
  user_id: string
  tenant_id: string
  role: 'owner' | 'admin' | 'member'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Warm connections early for better performance
  await connection()
  
  // Parallel data fetching for improved performance
  const [
    supabaseClient,
    quickActions,
    headersList
  ] = await Promise.all([
    createClient(),
    getQuickActions(),
    headers()
  ])
  
  const { data: { user } } = await supabaseClient.auth.getUser()
  
  // Fallback protection - redirect to signin if not authenticated
  // This should rarely happen due to middleware, but provides extra security
  if (!user) {
    redirect('/signin')
  }
  
  // Check if we have tenant from subdomain/custom domain (set by middleware)
  const tenantId = headersList.get('x-tenant-id')
  const isCustomDomain = headersList.get('x-tenant-custom-domain') === 'true'
  
  let tenant: Tenant | null = null
  let membership: Membership
  
  if (tenantId) {
    // Parallel tenant operations for better performance
    const [tenantResult, hasAccess, tenantData] = await Promise.all([
      getTenantById(tenantId),
      checkTenantAccess(user.id, tenantId),
      getUserTenantData(user.id, tenantId)
    ])
    
    tenant = tenantResult
    
    if (!tenant) {
      // Tenant not found
      return new Response('Tenant not found', { status: 404 })
    }
    
    if (!hasAccess) {
      // User doesn't have access to this tenant
      redirect('/signin?error=access_denied')
    }
    
    // Get user's membership for this tenant
    if (tenantData) {
      membership = {
        id: tenantData.id,
        user_id: tenantData.user_id,
        tenant_id: tenantData.tenant_id,
        role: tenantData.role as 'owner' | 'admin' | 'member',
      }
    } else {
      // If user has access but no membership data found, provide a fallback
      membership = {
        id: 'temp-membership',
        user_id: user.id,
        tenant_id: tenantId,
        role: 'member' as const,
      }
    }
  } else {
    // No subdomain - use user's primary tenant
    const tenantData = await getUserTenantData(user.id)
    
    if (!tenantData) {
      // User has no tenant membership, redirect to setup or create tenant
      // TODO: Redirect to tenant setup page when implemented
      // For now, fall back to a default tenant
      tenant = {
        id: '1',
        name: 'Catalyst Veterinary',
        slug: 'catalyst-veterinary',
        logo: 'https://nttivargznlzofkcbqtn.supabase.co/storage/v1/object/sign/assets/tenants/logoipsum-356.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNWZkOGRjYS0yNDc3LTRkYzQtOTM3Yy1mNWZlMGY5MmEyOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvdGVuYW50cy9sb2dvaXBzdW0tMzU2LnN2ZyIsImlhdCI6MTc1MTgzNTUyMywiZXhwIjo0ODczODk5NTIzfQ.XyQZX2mx5a1ABkwF1hue4KiOzTfBqBkZPp9B_ud8x5Q',
        subdomain: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        custom_domain: null,
        primary_color: null,
        settings: {}
      }
      
      membership = {
        id: '1',
        user_id: user.id,
        tenant_id: '1',
        role: 'owner' as const,
      }
    } else {
      // Use actual tenant data from database
      tenant = tenantData.tenant
      membership = {
        id: tenantData.id,
        user_id: tenantData.user_id,
        tenant_id: tenantData.tenant_id,
        role: tenantData.role as 'owner' | 'admin' | 'member',
      }
    }
  }

  return (
    <TenantProvider 
      initialTenant={tenant} 
      isSubdomain={!!tenantId && !isCustomDomain}
      isCustomDomain={isCustomDomain}
    >
      <AnimalSearchProvider>
        <ApplicationLayout quickActions={quickActions} user={user} tenant={tenant} membership={membership}>
          {children}
        </ApplicationLayout>
      </AnimalSearchProvider>
    </TenantProvider>
  )
}
