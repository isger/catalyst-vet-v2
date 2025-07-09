import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchPaginatedCustomers } from '@/server/actions/customers'
import { getCustomerStats } from '@/server/queries/customers'
import CustomerPageClient from './customer-page-client'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const pageSize =
    typeof searchParams.pageSize === 'string'
      ? Number(searchParams.pageSize)
      : 10
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined
  const sortBy =
    typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'createdAt'
  const sortOrder =
    typeof searchParams.sortOrder === 'string' ? searchParams.sortOrder : 'desc'

  // Fetch initial data on the server
  const [initialCustomers, stats] = await Promise.all([
    fetchPaginatedCustomers({ page, pageSize, search, sortBy, sortOrder }),
    getCustomerStats(),
  ])

  return (
    <>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-zinc-950 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Customer Management
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button outline>Export</Button>
          <Link href="/customers/new">
            <Button className="ml-3">Add Customer</Button>
          </Link>
        </div>
      </div>

      <CustomerPageClient initialCustomers={initialCustomers} stats={stats} />
    </>
  )
}