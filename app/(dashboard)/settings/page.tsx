import { Button } from '@/components/ui/button'
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
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Settings',
}

async function getTenantData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('tenant_membership')
    .select(`
      *,
      tenant:tenant(*)
    `)
    .eq('user_id', user.id)
    .single()

  return membership
}

export default async function Settings() {
  const tenantData = await getTenantData()
  const tenant = tenantData?.tenant
  
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <Heading>Settings</Heading>
        <Text className="mt-2">Manage your practice settings and staff members.</Text>
      </div>

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
