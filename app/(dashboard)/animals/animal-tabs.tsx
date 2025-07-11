'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo, useState, useEffect } from 'react'
import { usePaginatedAnimals } from '@/hooks/use-animals'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { calculateAge, formatWeight } from '@/lib/schemas/animal-intake'
import type { PaginatedAnimalsResult } from '@/server/queries/animals'

interface TabProps {
  searchQuery?: string
  sortBy?: string
  initialData?: PaginatedAnimalsResult
}

interface AllAnimalsProps extends TabProps {
  onSearchChange?: (search: string) => void
}

interface SortableHeaderProps {
  children: React.ReactNode
  sortKey: string
  currentSort: string
  onSort: (key: string) => void
}

function SortableHeader({
  children,
  sortKey,
  currentSort,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey
  const isReverse = currentSort === `-${sortKey}`

  return (
    <TableHeader
      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="text-xs text-zinc-400">
          {isActive ? '↑' : isReverse ? '↓' : '↕'}
        </span>
      </div>
    </TableHeader>
  )
}

export function AllAnimals({ initialData, searchQuery }: AllAnimalsProps) {
  // Initialize pagination with URL parameters and total from initial data
  const pagination = usePagination({
    initialSortBy: 'name',
    initialPageSize: 10,
    initialSearch: searchQuery || '',
    total: initialData?.totalCount || 0,
    useUrlParams: true,
  })
  
  // Sync external search query with internal pagination state
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== pagination.search) {
      pagination.setSearch(searchQuery)
    }
  }, [searchQuery, pagination])

  // Re-fetch data when pagination changes
  const { animals, total, loading, error } = usePaginatedAnimals({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: pagination.debouncedSearch, // Use debounced search for API calls
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  })

  // Use the paginated results, falling back to initial data
  const finalAnimals = animals || initialData?.animals || []
  const finalTotal = total || initialData?.totalCount || 0

  const handleSort = (key: string) => {
    // Map display column names to database column names
    const columnMap: Record<string, string> = {
      name: 'name',
      species: 'species',
      breed: 'breed',
      age: 'date_of_birth',
      weight: 'weight_kg',
      owner: 'owner.first_name',
      dateAdded: 'created_at',
    }

    const dbColumn = columnMap[key] || key
    pagination.toggleSort(dbColumn)
  }

  // Helper to determine current sort state for the sortable header
  const getCurrentSort = (column: string) => {
    const columnMap: Record<string, string> = {
      name: 'name',
      species: 'species',
      breed: 'breed',
      age: 'date_of_birth',
      weight: 'weight_kg',
      owner: 'owner.first_name',
      dateAdded: 'created_at',
    }

    const dbColumn = columnMap[column] || column
    if (pagination.sortBy === dbColumn) {
      return pagination.sortOrder === 'desc' ? column : `-${column}`
    }
    return ''
  }

  // Function to get species badge color
  const getSpeciesBadgeColor = (species: string): 'zinc' | 'indigo' | 'cyan' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'sky' | 'blue' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' => {
    const colors: Record<string, 'zinc' | 'indigo' | 'cyan' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'sky' | 'blue' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'> = {
      'Dog': 'blue',
      'Cat': 'purple',
      'Bird': 'yellow',
      'Rabbit': 'green',
      'Fish': 'cyan',
      'Reptile': 'orange',
      'Horse': 'zinc',
      'Hamster': 'pink',
      'Guinea Pig': 'red',
      'Ferret': 'zinc',
    }
    return colors[species] || 'zinc'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
            All Animals
          </h4>
          <Badge color="green">Loading...</Badge>
        </div>
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <TableHeader>Animal</TableHeader>
              <TableHeader>Species</TableHeader>
              <TableHeader>Breed</TableHeader>
              <TableHeader>Age</TableHeader>
              <TableHeader>Weight</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Date Added</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
            All Animals
          </h4>
          <Badge color="red">Error</Badge>
        </div>
        <div className="text-center py-8 text-red-500 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
          All Animals
        </h4>
        <Badge color="green">{finalTotal} animals</Badge>
      </div>

      {finalAnimals.length === 0 && !loading ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {pagination.search
            ? 'No animals found matching your search.'
            : 'No animals found'}
        </div>
      ) : (
        <>
          <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
            <TableHead>
              <TableRow>
                <SortableHeader
                  sortKey="name"
                  currentSort={getCurrentSort('name')}
                  onSort={handleSort}
                >
                  Animal
                </SortableHeader>
                <SortableHeader
                  sortKey="species"
                  currentSort={getCurrentSort('species')}
                  onSort={handleSort}
                >
                  Species
                </SortableHeader>
                <SortableHeader
                  sortKey="breed"
                  currentSort={getCurrentSort('breed')}
                  onSort={handleSort}
                >
                  Breed
                </SortableHeader>
                <SortableHeader
                  sortKey="age"
                  currentSort={getCurrentSort('age')}
                  onSort={handleSort}
                >
                  Age
                </SortableHeader>
                <SortableHeader
                  sortKey="weight"
                  currentSort={getCurrentSort('weight')}
                  onSort={handleSort}
                >
                  Weight
                </SortableHeader>
                <SortableHeader
                  sortKey="owner"
                  currentSort={getCurrentSort('owner')}
                  onSort={handleSort}
                >
                  Owner
                </SortableHeader>
                <SortableHeader
                  sortKey="dateAdded"
                  currentSort={getCurrentSort('dateAdded')}
                  onSort={handleSort}
                >
                  Date Added
                </SortableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {finalAnimals.map((animal) => (
                <TableRow
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  title={`View ${animal.name}'s details`}
                >
                  <TableCell>
                    <div className="font-medium text-zinc-950 dark:text-white">
                      {animal.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={getSpeciesBadgeColor(animal.species)}>
                      {animal.species}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {animal.breed || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {animal.date_of_birth ? calculateAge(animal.date_of_birth) : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {formatWeight(animal.weight_kg)}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    <div className="font-medium">
                      {animal.owner.first_name} {animal.owner.last_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {new Date(animal.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="relative">
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={finalTotal}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              onPreviousPage={pagination.previousPage}
              onNextPage={pagination.nextPage}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white"></div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function BySpecies({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)

  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  // Mock data for species - in production this would come from the animals hook
  const speciesData = useMemo(() => {
    let filtered = [
      { species: 'Dog', count: 25, lastAdded: '2 days ago' },
      { species: 'Cat', count: 18, lastAdded: '1 day ago' },
      { species: 'Bird', count: 8, lastAdded: '3 days ago' },
      { species: 'Rabbit', count: 5, lastAdded: '1 week ago' },
      { species: 'Fish', count: 12, lastAdded: '5 days ago' },
    ]

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.species.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0

      switch (sortKey) {
        case 'species':
          comparison = a.species.localeCompare(b.species)
          break
        case 'count':
          comparison = a.count - b.count
          break
        default:
          comparison = 0
      }

      return isReverse ? -comparison : comparison
    })
  }, [searchQuery, currentSort])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
          Animals by Species
        </h4>
        <Badge color="blue">{speciesData.length} species</Badge>
      </div>

      {speciesData.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery
            ? 'No species found matching your search.'
            : 'No species data available'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader
                sortKey="species"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Species
              </SortableHeader>
              <SortableHeader
                sortKey="count"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Count
              </SortableHeader>
              <TableHeader>Last Added</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {speciesData.map((item) => (
              <TableRow key={item.species}>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {item.species}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="blue">{item.count}</Badge>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {item.lastAdded}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function RecentAdditions({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)

  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  // Mock data for recent additions - in production this would filter animals by date
  const recentAnimals = useMemo(() => {
    let filtered = [
      {
        name: 'Bella',
        species: 'Dog',
        owner: 'Sarah Johnson',
        addedDate: '2024-01-15',
        daysAgo: '1 day ago',
      },
      {
        name: 'Whiskers',
        species: 'Cat',
        owner: 'Mike Chen',
        addedDate: '2024-01-14',
        daysAgo: '2 days ago',
      },
      {
        name: 'Charlie',
        species: 'Bird',
        owner: 'Emma Davis',
        addedDate: '2024-01-13',
        daysAgo: '3 days ago',
      },
    ]

    if (searchQuery) {
      filtered = filtered.filter(
        (animal) =>
          animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
          animal.owner.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'species':
          comparison = a.species.localeCompare(b.species)
          break
        case 'owner':
          comparison = a.owner.localeCompare(b.owner)
          break
        case 'date':
          comparison =
            new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
          break
        default:
          comparison = 0
      }

      return isReverse ? -comparison : comparison
    })
  }, [searchQuery, currentSort])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
          Recent Additions
        </h4>
        <Badge color="green">{recentAnimals.length} new animals</Badge>
      </div>

      {recentAnimals.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery
            ? 'No recent animals found matching your search.'
            : 'No recent additions found'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader
                sortKey="name"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Animal
              </SortableHeader>
              <SortableHeader
                sortKey="species"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Species
              </SortableHeader>
              <SortableHeader
                sortKey="owner"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Owner
              </SortableHeader>
              <SortableHeader
                sortKey="date"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Added
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentAnimals.map((animal, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {animal.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="blue">{animal.species}</Badge>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {animal.owner}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {animal.daysAgo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function MedicalAlerts({ searchQuery = '', sortBy = 'priority' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)

  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  // Mock data for medical alerts
  const alerts = useMemo(() => {
    let filtered = [
      {
        animal: 'Max',
        owner: 'Sarah Johnson',
        alert: 'Vaccination due',
        priority: 'High',
        dueDate: '2024-01-18',
      },
      {
        animal: 'Luna',
        owner: 'Mike Chen',
        alert: 'Follow-up needed',
        priority: 'Medium',
        dueDate: '2024-01-20',
      },
      {
        animal: 'Charlie',
        owner: 'Emma Davis',
        alert: 'Medication review',
        priority: 'Low',
        dueDate: '2024-01-25',
      },
    ]

    if (searchQuery) {
      filtered = filtered.filter(
        (alert) =>
          alert.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.alert.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0

      switch (sortKey) {
        case 'animal':
          comparison = a.animal.localeCompare(b.animal)
          break
        case 'priority':
          const priorityOrder: Record<string, number> = {
            High: 3,
            Medium: 2,
            Low: 1,
          }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'dueDate':
          comparison =
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'alert':
          comparison = a.alert.localeCompare(b.alert)
          break
        default:
          comparison = 0
      }

      return isReverse ? -comparison : comparison
    })
  }, [searchQuery, currentSort])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
          Medical Alerts
        </h4>
        <Badge color="red">{alerts.length} alerts</Badge>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery
            ? 'No alerts found matching your search.'
            : 'No medical alerts'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader
                sortKey="animal"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Animal
              </SortableHeader>
              <TableHeader>Owner</TableHeader>
              <SortableHeader
                sortKey="alert"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Alert
              </SortableHeader>
              <SortableHeader
                sortKey="priority"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Priority
              </SortableHeader>
              <SortableHeader
                sortKey="dueDate"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Due Date
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {alert.animal}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {alert.owner}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {alert.alert}
                </TableCell>
                <TableCell>
                  <Badge
                    color={
                      alert.priority === 'High'
                        ? 'red'
                        : alert.priority === 'Medium'
                        ? 'yellow'
                        : 'zinc'
                    }
                  >
                    {alert.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {new Date(alert.dueDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function UpcomingAppointments({ searchQuery = '', sortBy = 'time' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)

  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  // Mock data for upcoming appointments
  const appointments = useMemo(() => {
    let filtered = [
      {
        time: '9:00 AM',
        animal: 'Bella',
        owner: 'Sarah Johnson',
        type: 'Checkup',
        status: 'Confirmed',
      },
      {
        time: '10:30 AM',
        animal: 'Max',
        owner: 'Mike Chen',
        type: 'Vaccination',
        status: 'Pending',
      },
      {
        time: '2:00 PM',
        animal: 'Charlie',
        owner: 'Emma Davis',
        type: 'Surgery',
        status: 'Confirmed',
      },
    ]

    if (searchQuery) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0

      switch (sortKey) {
        case 'animal':
          comparison = a.animal.localeCompare(b.animal)
          break
        case 'time':
          comparison = a.time.localeCompare(b.time)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }

      return isReverse ? -comparison : comparison
    })
  }, [searchQuery, currentSort])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">
          Upcoming Appointments
        </h4>
        <Badge color="amber">{appointments.length} appointments</Badge>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery
            ? 'No appointments found matching your search.'
            : 'No upcoming appointments'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader
                sortKey="time"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Time
              </SortableHeader>
              <SortableHeader
                sortKey="animal"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Animal
              </SortableHeader>
              <TableHeader>Owner</TableHeader>
              <SortableHeader
                sortKey="type"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Appointment Type
              </SortableHeader>
              <SortableHeader
                sortKey="status"
                currentSort={currentSort}
                onSort={handleSort}
              >
                Status
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge color="amber">{appointment.time}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {appointment.animal}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {appointment.owner}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {appointment.type}
                </TableCell>
                <TableCell>
                  <Badge
                    color={appointment.status === 'Confirmed' ? 'green' : 'yellow'}
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}