import { getEvents } from '@/data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationLayout } from './application-layout'
import { getUserTenantData } from '@/server/queries/tenant'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fallback protection - redirect to signin if not authenticated
  // This should rarely happen due to middleware, but provides extra security
  if (!user) {
    redirect('/signin')
  }
  
  const events = await getEvents()
  
  // Fetch user's tenant data and membership from database
  const tenantData = await getUserTenantData(user.id)
  
  // If user has no tenant membership, redirect to setup or create tenant
  if (!tenantData) {
    // TODO: Redirect to tenant setup page when implemented
    // For now, fall back to a default tenant
    const tenant = {
      id: '1',
      name: 'Catalyst Veterinary',
      logo: 'https://nttivargznlzofkcbqtn.supabase.co/storage/v1/object/sign/assets/tenants/logoipsum-356.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNWZkOGRjYS0yNDc3LTRkYzQtOTM3Yy1mNWZlMGY5MmEyOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvdGVuYW50cy9sb2dvaXBzdW0tMzU2LnN2ZyIsImlhdCI6MTc1MTgzNTUyMywiZXhwIjo0ODczODk5NTIzfQ.XyQZX2mx5a1ABkwF1hue4KiOzTfBqBkZPp9B_ud8x5Q',
    }
    
    const membership = {
      id: '1',
      user_id: user.id,
      tenant_id: '1',
      role: 'owner' as const,
    }
    
    return <ApplicationLayout events={events} user={user} tenant={tenant} membership={membership}>{children}</ApplicationLayout>
  }
  
  // Use actual tenant data from database
  const tenant = tenantData.tenant
  const membership = {
    id: tenantData.membership.id,
    user_id: tenantData.membership.userId,
    tenant_id: tenantData.membership.tenantId,
    role: tenantData.membership.role as 'owner' | 'admin' | 'member',
  }

  return <ApplicationLayout events={events} user={user} tenant={tenant} membership={membership}>{children}</ApplicationLayout>
}
