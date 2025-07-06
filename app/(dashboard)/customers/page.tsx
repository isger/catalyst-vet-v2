import Link from 'next/link'
import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ActiveCustomers, NewClients, Consultation, FollowUp, Inactive } from './customer-tabs'
import { Input, InputGroup } from '@/components/ui/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Select } from '@/components/ui/select'

export default function Customers() {
  return (
    <>
      <Heading>Customer Management</Heading>
      <div className="mt-8">
        <PageHeader
          title="Customers"
          actions={
            <>
              <Button outline>Export</Button>
              <Link href="/customers/new">
                <Button className="ml-3">Add Customer</Button>
              </Link>
            </>
          }
        />
        
        <Tabs defaultValue="active" className="mt-6">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="new-clients">New Clients</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
            <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <div className="my-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon/>
                <Input name="search" placeholder="Search customers&hellip;"/>
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by">
                <option value="name">Sort by name</option>
                <option value="status">Sort by status</option>
              </Select>
            </div>
          </div>
          
          <TabsContent value="active">
            <ActiveCustomers/>
          </TabsContent>
          <TabsContent value="new-clients">
            <NewClients/>
          </TabsContent>
          <TabsContent value="consultation">
            <Consultation/>
          </TabsContent>
          <TabsContent value="follow-up">
            <FollowUp/>
          </TabsContent>
          <TabsContent value="inactive">
            <Inactive/>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
