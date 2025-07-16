import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { signOut } from '@/server/actions/auth'
import { DonutChart } from '@/components/charts/donut-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { RadialBarChart } from '@/components/charts/radial-bar-chart'

async function UserInfo() {
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
  )
}

function UserInfoSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <div className="mb-8 md:flex md:items-center md:justify-between">
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
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              You are signed in as {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<UserInfoSkeleton />}>
              <UserInfo />
            </Suspense>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart />
          <AreaChart />
          <BarChart />
          <LineChart />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RadialBarChart />
        </div>
      </div>
    </>
  )
}