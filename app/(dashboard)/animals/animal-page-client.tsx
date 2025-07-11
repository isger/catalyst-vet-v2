'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { HeartIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { calculateAge, formatWeight } from '@/lib/schemas/animal-intake'
import type { PaginatedAnimalsResult, AnimalStats } from '@/server/queries/animals'

interface AnimalPageClientProps {
  initialAnimals: PaginatedAnimalsResult
  stats: AnimalStats
}

export default function AnimalPageClient({ initialAnimals, stats }: AnimalPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for animals data
  const [animals] = useState(initialAnimals)
  const [loading] = useState(false)
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc')
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10)
  
  // Debounce search term
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
    if (sortBy !== 'created_at') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    if (pageSize !== 10) params.set('pageSize', pageSize.toString())
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/animals${newUrl}`, { scroll: false })
  }, [debouncedSearchTerm, sortBy, sortOrder, currentPage, pageSize, router])

  // Reset to first page when search/sort changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, sortBy, sortOrder, currentPage])

  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Function to get species badge color
  const getSpeciesBadgeColor = (species: string) => {
    const colors: Record<string, string> = {
      'Dog': 'bg-blue-100 text-blue-800',
      'Cat': 'bg-purple-100 text-purple-800',
      'Bird': 'bg-yellow-100 text-yellow-800',
      'Rabbit': 'bg-green-100 text-green-800',
      'Fish': 'bg-cyan-100 text-cyan-800',
      'Reptile': 'bg-orange-100 text-orange-800',
      'Horse': 'bg-brown-100 text-brown-800',
      'Hamster': 'bg-pink-100 text-pink-800',
      'Guinea Pig': 'bg-red-100 text-red-800',
      'Ferret': 'bg-gray-100 text-gray-800',
    }
    return colors[species] || 'bg-gray-100 text-gray-800'
  }

  // Calculate pagination info
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, animals.totalCount)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              Active animals in your practice
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Species Types</CardTitle>
            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpecies}</div>
            <p className="text-xs text-muted-foreground">
              Different species types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Animals</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAnimals}</div>
            <p className="text-xs text-muted-foreground">
              Added in last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAge} years</div>
            <p className="text-xs text-muted-foreground">
              Average age of animals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search animals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Date Added</option>
            <option value="name">Name</option>
            <option value="species">Species</option>
            <option value="age">Age</option>
            <option value="owner">Owner</option>
          </Select>
          
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </Select>
          
          <Select value={pageSize.toString()} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>

      {/* Animals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Animals</CardTitle>
          <CardDescription>
            {animals.totalCount > 0 ? (
              `Showing ${startIndex}-${endIndex} of ${animals.totalCount} animals`
            ) : (
              'No animals found'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : animals.animals.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No animals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first animal.'}
              </p>
              <div className="mt-6">
                <Link href="/animals/new">
                  <Button>Add Animal</Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      plain
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Name
                      {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      plain
                      onClick={() => handleSort('species')}
                      className="h-auto p-0 font-semibold"
                    >
                      Species
                      {sortBy === 'species' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>
                    <Button
                      plain
                      onClick={() => handleSort('age')}
                      className="h-auto p-0 font-semibold"
                    >
                      Age
                      {sortBy === 'age' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>
                    <Button
                      plain
                      onClick={() => handleSort('owner')}
                      className="h-auto p-0 font-semibold"
                    >
                      Owner
                      {sortBy === 'owner' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      plain
                      onClick={() => handleSort('created_at')}
                      className="h-auto p-0 font-semibold"
                    >
                      Date Added
                      {sortBy === 'created_at' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">
                      <Link href={`/animals/${animal.id}`} className="hover:underline">
                        {animal.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSpeciesBadgeColor(animal.species)}>
                        {animal.species}
                      </Badge>
                    </TableCell>
                    <TableCell>{animal.breed || 'Unknown'}</TableCell>
                    <TableCell>
                      {animal.date_of_birth ? calculateAge(animal.date_of_birth) : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {formatWeight(animal.weight_kg)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/customers/${animal.owner_id}`} className="hover:underline">
                        {animal.owner.first_name} {animal.owner.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(animal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/animals/${animal.id}`}>
                          <Button outline>
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {animals.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {animals.totalCount} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              outline
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, animals.totalPages) }, (_, i) => {
                const pageNum = i + 1
                return currentPage === pageNum ? (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                ) : (
                  <Button
                    key={pageNum}
                    outline
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              outline
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === animals.totalPages}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}