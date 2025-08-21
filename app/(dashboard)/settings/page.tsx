import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox, CheckboxField } from '@/components/ui/checkbox'
import { Divider } from '@/components/ui/divider'
import { Label } from '@/components/ui/fieldset'
import { Heading, Subheading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import type { Metadata } from 'next'
import { Address } from './address'
import { StaffManagement } from './staff-management'
import { TenantMetadataUpdater } from '@/components/features/settings/tenant-metadata-updater'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserTenant } from '@/lib/tenant/current-user'

export const metadata: Metadata = {
  title: 'Settings',
}

interface UserInfoProps {
  user: any
  tenantData: any
}

function UserInfo({ user, tenantData }: UserInfoProps) {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>User ID: {user?.id}</p>
      {tenantData && (
        <>
          <p>Tenant ID: {tenantData.tenant_id}</p>
          <p>Organization: {tenantData.tenant?.name || tenantData.tenant_id}</p>
          <p>Role: {tenantData.role}</p>
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

export default async function Settings() {
  const tenantData = await getCurrentUserTenant()
  const tenant = tenantData?.tenant
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user has tenant_id in app_metadata
  const hasAppMetadata = !!(user?.app_metadata?.tenant_id)
  const currentTenantId = user?.app_metadata?.tenant_id
  
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <Heading>Settings</Heading>
        <Text className="mt-2">Manage your practice settings and staff members.</Text>
      </div>

      {/* Tenant metadata updater for existing users */}
      <TenantMetadataUpdater 
        currentTenantId={currentTenantId}
        hasAppMetadata={hasAppMetadata}
      />

      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            You are signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserInfo user={user} tenantData={tenantData} />
        </CardContent>
      </Card>

      <Divider />

      <StaffManagement userRole={tenantData?.role} />

      <Divider />

      <form method="post" className="space-y-10">
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Practice Name</Subheading>
            <Text>This will be displayed on your public profile.</Text>
          </div>
          <div>
            <Input 
              aria-label="Practice Name" 
              name="name" 
              defaultValue={tenant?.name || ''} 
            />
          </div>
        </section>

      <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Practice Description</Subheading>
            <Text>This will be displayed on your public profile. Maximum 240 characters.</Text>
          </div>
          <div>
            <Textarea 
              aria-label="Practice Description" 
              name="description" 
              defaultValue=""
            />
          </div>
        </section>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Contact Email</Subheading>
            <Text>This is how pet owners can contact you for appointments.</Text>
          </div>
          <div className="space-y-4">
            <Input 
              type="email" 
              aria-label="Contact Email" 
              name="email" 
              defaultValue="" 
            />
            <CheckboxField>
              <Checkbox name="email_is_public" defaultChecked />
              <Label>Show email on public profile</Label>
            </CheckboxField>
          </div>
        </section>

      <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Address</Subheading>
            <Text>This is where your practice is located.</Text>
          </div>
          <Address />
        </section>

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Currency</Subheading>
            <Text>The currency that your practice will be collecting.</Text>
          </div>
          <div>
            <Select aria-label="Currency" name="currency" defaultValue="cad">
              <option value="cad">CAD - Canadian Dollar</option>
              <option value="usd">USD - United States Dollar</option>
            </Select>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <Button type="reset" plain>
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  )
}
