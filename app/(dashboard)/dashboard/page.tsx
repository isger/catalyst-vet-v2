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
      .from('tenant_membership')
      .select(`
        tenant_id,
        role,
        status,
        tenant (
          id,
          name,
          subdomain
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    tenantInfo = membershipData
  }

  return (
      <>
        <div className="md:flex md:items-center md:justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl/7 font-bold text-zinc-950 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
          </div>
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
                    <p>Tenant ID: {tenantInfo.tenant_id}</p>
                    <p>Organization: {tenantInfo.tenant?.name}</p>
                    <p>Role: {tenantInfo.role}</p>
                  </>
              )}
            </div>
          </CardContent>
        </Card>
      </>
  )
}