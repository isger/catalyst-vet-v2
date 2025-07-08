import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list'
import { Divider } from '@/components/ui/divider'
import { Heading, Subheading } from '@/components/ui/heading'
import { Link } from '@/components/ui/link'
import { getCustomerByIdForTenant } from '@/server/queries/customers'
import { ChevronLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const customer = await getCustomerByIdForTenant(id)

  return {
    title: customer && `${customer.firstName} ${customer.lastName}`,
  }
}

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await getCustomerByIdForTenant(id)

  if (!customer) {
    notFound()
  }

  const customerInitials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()
  const customerSince = new Date(customer.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

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
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Customer since{' '}
                <time dateTime={customer.createdAt}>{customerSince}</time>
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
                {customer.patients.length > 0 && (
                  <Badge color="lime" className="text-xs">
                    {customer.patients.length} pet{customer.patients.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <Button outline>
              Edit Customer
            </Button>
            <Button color="indigo">
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Customer Information</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Full Name</DescriptionTerm>
          <DescriptionDetails>{customer.firstName} {customer.lastName}</DescriptionDetails>
          <DescriptionTerm>Email</DescriptionTerm>
          <DescriptionDetails>{customer.email}</DescriptionDetails>
          <DescriptionTerm>Phone</DescriptionTerm>
          <DescriptionDetails>{customer.phone}</DescriptionDetails>
          <DescriptionTerm>Address</DescriptionTerm>
          <DescriptionDetails>
            {customer.address ? (
              <div>
                <div>{customer.address.street}</div>
                <div>{customer.address.city}, {customer.address.state} {customer.address.zip}</div>
                <div>{customer.address.country}</div>
              </div>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">No address on file</span>
            )}
          </DescriptionDetails>
          <DescriptionTerm>Customer Since</DescriptionTerm>
          <DescriptionDetails>{new Date(customer.createdAt).toLocaleDateString()}</DescriptionDetails>
          <DescriptionTerm>Last Visit</DescriptionTerm>
          <DescriptionDetails>
            {customer.lastVisit ? (
              new Date(customer.lastVisit).toLocaleDateString()
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">No visits yet</span>
            )}
          </DescriptionDetails>
        </DescriptionList>
      </div>

      <div className="mt-12">
        <Subheading>Pets</Subheading>
        <Divider className="mt-4" />
        {customer.patients.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customer.patients.map((pet) => (
              <div key={pet.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <h4 className="font-medium text-zinc-950 dark:text-white">{pet.name}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {pet.species} {pet.breed && `• ${pet.breed}`}
                </p>
                {pet.dateOfBirth && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Born: {new Date(pet.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-2">
                  <Badge color="zinc" className="text-xs">Pet ID: {pet.id}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No pets registered yet</p>
            <Button className="mt-4" outline>Add Pet</Button>
          </div>
        )}
      </div>

      <div className="mt-12">
        <Subheading>Appointment History</Subheading>
        <Divider className="mt-4" />
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Appointment history coming soon</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
            View and manage all past and upcoming appointments
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Medical Records</Subheading>
        <Divider className="mt-4" />
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Medical records coming soon</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
            Access vaccination records, treatments, and medical notes
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>Billing & Payments</Subheading>
        <Divider className="mt-4" />
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Billing information coming soon</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
            View invoices, payments, and outstanding balances
          </p>
        </div>
      </div>
    </>
  )
}