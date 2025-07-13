import { getEvents } from '@/data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ApplicationLayout } from './application-layout'
import { getUserTenantData } from '@/server/queries/tenant'
import { getTenantById, checkTenantAccess } from '@/lib/tenant/resolver'
import { TenantProvider } from '@/components/providers/tenant-provider'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fallback protection - redirect to signin if not authenticated
  // This should rarely happen due to middleware, but provides extra security
  if (!user) {
    redirect('/signin')
  }
  
  const events = await getEvents()
  const headersList = await headers()
  
  // Check if we have tenant from subdomain/custom domain (set by middleware)
  const tenantId = headersList.get('x-tenant-id')
  const isCustomDomain = headersList.get('x-tenant-custom-domain') === 'true'
  
  let tenant = null
  let membership = null
  
  if (tenantId) {
    // We have a tenant from subdomain/custom domain
    tenant = await getTenantById(tenantId)
    
    if (!tenant) {
      // Tenant not found
      return new Response('Tenant not found', { status: 404 })
    }
    
    // Check if user has access to this tenant
    const hasAccess = await checkTenantAccess(user.id, tenantId)
    
    if (!hasAccess) {
      // User doesn't have access to this tenant
      redirect('/signin?error=access_denied')
    }
    
    // Get user's membership for this tenant
    const tenantData = await getUserTenantData(user.id, tenantId)
    if (tenantData) {
      membership = {
        id: tenantData.id,
        user_id: tenantData.user_id,
        tenant_id: tenantData.tenant_id,
        role: tenantData.role as 'owner' | 'admin' | 'member',
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
        logo: 'https://nttivargznlzofkcbqtn.supabase.co/storage/v1/object/sign/assets/tenants/logoipsum-356.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNWZkOGRjYS0yNDc3LTRkYzQtOTM3Yy1mNWZlMGY5MmEyOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvdGVuYW50cy9sb2dvaXBzdW0tMzU2LnN2ZyIsImlhdCI6MTc1MTgzNTUyMywiZXhwIjo0ODczODk5NTIzfQ.XyQZX2mx5a1ABkwF1hue4KiOzTfBqBkZPp9B_ud8x5Q',
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
      <ApplicationLayout events={events} user={user} tenant={tenant} membership={membership}>
        {children}
      </ApplicationLayout>
    </TenantProvider>
  )
}
