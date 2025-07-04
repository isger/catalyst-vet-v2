import { getEvents } from '@/data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/signin')
  }
  
  const events = await getEvents()
  
  // Mock tenant data - in real app this would be fetched from database
  const tenant = {
    id: '1',
    name: 'Catalyst Veterinary',
    logo: '/teams/catalyst.svg',
  }
  
  const membership = {
    id: '1',
    user_id: user.id,
    tenant_id: '1',
    role: 'owner' as const,
  }

  return <ApplicationLayout events={events} user={user} tenant={tenant} membership={membership}>{children}</ApplicationLayout>
}
