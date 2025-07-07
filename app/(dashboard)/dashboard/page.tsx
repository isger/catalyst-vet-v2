import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from '@/server/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's tenant membership information
  let tenantInfo = null
  if (user) {
    const { data: membershipData } = await supabase
      .from('TenantMembership')
      .select(`
        tenantId,
        role,
        status,
        Tenant (
          id,
          name,
          subdomain
        )
      `)
      .eq('userId', user.id)
      .eq('status', 'active')
      .single()

    tenantInfo = membershipData
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form onSubmit={signOut}>
          <Button type="submit">
            Sign Out
          </Button>
        </form>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            You are signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>User ID: {user?.id}</p>
            {tenantInfo && (
              <>
                <p>Tenant ID: {tenantInfo.tenantId}</p>
                <p>Organization: {tenantInfo.Tenant?.name}</p>
                <p>Role: {tenantInfo.role}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}