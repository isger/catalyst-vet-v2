import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Subheading } from '@/components/ui/heading'
import { Link } from '@/components/ui/link'
import { getCustomerByIdForTenant } from '@/server/queries/customers'
import { CustomerBasicInfoForm } from '@/components/features/customers/customer-basic-info-form'
import { ChevronLeftIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomerDetailClient } from './customer-detail-client'
import type { Tab } from '@/components/ui/tabs-v2'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const customer = await getCustomerByIdForTenant(id)

  return {
    title: customer && `${customer.first_name} ${customer.last_name}`,
  }
}

export default async function CustomerDetail({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = typeof tab === 'string' ? tab : 'customer-info'
  const customer = await getCustomerByIdForTenant(id)

  if (!customer) {
    notFound()
  }

  const customerInitials = `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase()
  const customerSince = new Date(customer.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const tabs: Tab[] = [
    { name: 'Customer Information', value: 'customer-info' },
    { name: 'Insurance', value: 'insurance' },
    { name: 'Financial', value: 'financial' },
    { name: 'Communications', value: 'communications' }
  ]


  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Customers
        </Link>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="shrink-0">
              <div className="relative">
                <Avatar 
                  className="size-16" 
                  initials={customerInitials}
                />
                <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-inner" />
              </div>
            </div>
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
                {customer.first_name} {customer.last_name}
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Customer since{' '}
                <time dateTime={customer.created_at}>{customerSince}</time>
                {customer.lastVisit && (
                  <>
                    {' • '}
                    Last visit: <time dateTime={customer.lastVisit}>
                      {new Date(customer.lastVisit).toLocaleDateString()}
                    </time>
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <EnvelopeIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{customer.email}</span>
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <PhoneIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>{customer.phone}</span>
                </span>
                {customer.animals.length > 0 && (
                  <Badge color="lime" className="text-xs">
                    {customer.animals.length} pet{customer.animals.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <Button color="indigo">
              Add Pet
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8">
        <CustomerDetailClient
          customerId={id}
          activeTab={activeTab}
          tabs={tabs}
        />
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'customer-info' && (
          <CustomerBasicInfoForm customer={customer} />
        )}

        {activeTab === 'insurance' && (
          <>
            <Subheading>Insurance Information</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Insurance information coming soon</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                Manage pet insurance policies, coverage details, and claims
              </p>
            </div>
          </>
        )}

        {activeTab === 'financial' && (
          <>
            <Subheading>Billing & Payments</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Billing information coming soon</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                View invoices, payments, and outstanding balances
              </p>
            </div>
          </>
        )}

        {activeTab === 'communications' && (
          <>
            <Subheading>Appointment History</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Appointment history coming soon</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                View and manage all past and upcoming appointments
              </p>
            </div>

            <div className="mt-12">
              <Subheading>Communications Log</Subheading>
              <Divider className="mt-4" />
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">Communication logs coming soon</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                  Track emails, calls, and messages with this customer
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}