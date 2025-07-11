import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchPaginatedAnimals } from '@/server/queries/animals'
import { getAnimalStats } from '@/server/queries/animals'
import AnimalPageClient from './animal-page-client'

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? Number(params.page) : 1
  const pageSize =
    typeof params.pageSize === 'string'
      ? Number(params.pageSize)
      : 10
  const search =
    typeof params.search === 'string' ? params.search : undefined
  const sortBy =
    typeof params.sortBy === 'string' ? params.sortBy : 'created_at'
  const sortOrder =
    typeof params.sortOrder === 'string' && (params.sortOrder === 'asc' || params.sortOrder === 'desc') 
      ? params.sortOrder 
      : 'desc'

  // Fetch initial data on the server
  const [initialAnimals, stats] = await Promise.all([
    fetchPaginatedAnimals({ page, pageSize, search, sortBy, sortOrder }),
    getAnimalStats(),
  ])

  return (
    <>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-zinc-950 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Animal Management
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button outline>Export</Button>
          <Link href="/animals/new">
            <Button className="ml-3">Add Animal</Button>
          </Link>
        </div>
      </div>

      <AnimalPageClient initialAnimals={initialAnimals} stats={stats} />
    </>
  )
}