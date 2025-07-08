'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMemo, useState } from 'react'
import { usePaginatedCustomers } from '@/hooks/use-customers'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/ui/table-pagination'

interface TabProps {
  searchQuery?: string;
  sortBy?: string;
}

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: string;
  onSort: (key: string) => void;
}

function SortableHeader({ children, sortKey, currentSort, onSort }: SortableHeaderProps) {
  const isActive = currentSort === sortKey;
  const isReverse = currentSort === `-${sortKey}`;
  
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
  );
}


export function ActiveCustomers({}: TabProps) {
  // Initialize pagination with URL parameters
  const pagination = usePagination({
    initialSortBy: 'firstName',
    initialPageSize: 10,
    useUrlParams: true
  })

  // Use the new paginated customers hook
  const { 
    customers, 
    total, 
    loading, 
    error 
  } = usePaginatedCustomers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: pagination.search,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder
  })

  // Create pagination with total for controls
  const paginationWithTotal = usePagination({
    initialPage: pagination.page,
    initialPageSize: pagination.pageSize,
    initialSearch: pagination.search,
    initialSortBy: pagination.sortBy,
    initialSortOrder: pagination.sortOrder,
    total,
    useUrlParams: true
  })

  const handleSort = (key: string) => {
    // Map display column names to database column names
    const columnMap: Record<string, string> = {
      'name': 'firstName',
      'email': 'email',
      'lastVisit': 'createdAt', // We'll sort by creation date for now
      'petCount': 'firstName', // Default to name sorting for pet count
      'phone': 'phone',
      'joinDate': 'createdAt'
    }
    
    const dbColumn = columnMap[key] || key
    pagination.toggleSort(dbColumn)
  }

  // Helper to determine current sort state for the sortable header
  const getCurrentSort = (column: string) => {
    const columnMap: Record<string, string> = {
      'name': 'firstName',
      'email': 'email',
      'lastVisit': 'createdAt',
      'petCount': 'firstName',
      'phone': 'phone',
      'joinDate': 'createdAt'
    }
    
    const dbColumn = columnMap[column] || column
    if (pagination.sortBy === dbColumn) {
      return pagination.sortOrder === 'desc' ? column : `-${column}`
    }
    return ''
  }
  
  const formatLastVisit = (lastVisit: string | undefined) => {
    if (!lastVisit) return 'No visits yet'
    
    const date = new Date(lastVisit)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  const formatPets = (patients: { name: string; breed: string | null; species: string }[]) => {
    if (!patients || patients.length === 0) return 'No pets'
    if (patients.length === 1) {
      const pet = patients[0]
      return `${pet.name} (${pet.breed || pet.species})`
    }
    return `${patients.length} pets`
  }

  const formatPhone = (phone: string) => {
    if (!phone) return 'No phone'
    // Format phone number (assuming US format)
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Active Customers</h4>
          <Badge color="green">Loading...</Badge>
        </div>
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Pets</TableHeader>
              <TableHeader>Last Visit</TableHeader>
              <TableHeader>Member Since</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((i) => (
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
          <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Active Customers</h4>
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
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Active Customers</h4>
        <Badge color="green">{total} customers</Badge>
      </div>
      
      {customers.length === 0 && !loading ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {pagination.search ? 'No customers found matching your search.' : 'No active customers found'}
        </div>
      ) : (
        <>
          <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader sortKey="name" currentSort={getCurrentSort('name')} onSort={handleSort}>
                Customer
              </SortableHeader>
              <SortableHeader sortKey="email" currentSort={getCurrentSort('email')} onSort={handleSort}>
                Email
              </SortableHeader>
              <SortableHeader sortKey="phone" currentSort={getCurrentSort('phone')} onSort={handleSort}>
                Phone
              </SortableHeader>
              <SortableHeader sortKey="petCount" currentSort={getCurrentSort('petCount')} onSort={handleSort}>
                Pets
              </SortableHeader>
              <SortableHeader sortKey="lastVisit" currentSort={getCurrentSort('lastVisit')} onSort={handleSort}>
                Last Visit
              </SortableHeader>
              <SortableHeader sortKey="joinDate" currentSort={getCurrentSort('joinDate')} onSort={handleSort}>
                Member Since
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id} 
                href={`/customers/${customer.id}`}
                title={`View ${customer.firstName} ${customer.lastName}'s details`}
              >
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {customer.email}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {formatPhone(customer.phone)}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatPets(customer.patients)}
                    </span>
                    {customer.patients.length > 1 && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {customer.patients.map(p => p.name).join(', ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {formatLastVisit(customer.lastVisit)}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          page={paginationWithTotal.page}
          pageSize={paginationWithTotal.pageSize}
          total={total}
          totalPages={paginationWithTotal.totalPages}
          hasNextPage={paginationWithTotal.hasNextPage}
          hasPreviousPage={paginationWithTotal.hasPreviousPage}
          onPageChange={paginationWithTotal.setPage}
          onPageSizeChange={paginationWithTotal.setPageSize}
          onPreviousPage={paginationWithTotal.previousPage}
          onNextPage={paginationWithTotal.nextPage}
        />
        </>
      )}
    </div>
  )
}

export function NewClients({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)
  
  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  const clients = useMemo(() => {
    let filtered = [
      { name: 'Alex Rodriguez', pet: 'Bella (Labrador)', inquiry: 'Vaccination schedule', phone: '(555) 123-4567', email: 'alex@example.com' },
      { name: 'Lisa Park', pet: 'Whiskers (Maine Coon)', inquiry: 'Health checkup', phone: '(555) 234-5678', email: 'lisa@example.com' },
      { name: 'John Smith', pet: 'Rocky (German Shepherd)', inquiry: 'Training consultation', phone: '(555) 345-6789', email: 'john@example.com' },
      { name: 'Maria Garcia', pet: 'Fluffy (Persian Cat)', inquiry: 'Grooming consultation', phone: '(555) 456-7890', email: 'maria@example.com' },
      { name: 'David Kim', pet: 'Buddy (Golden Retriever)', inquiry: 'Behavioral training', phone: '(555) 567-8901', email: 'david@example.com' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.inquiry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'inquiry':
          comparison = a.inquiry.localeCompare(b.inquiry)
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
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">New Clients</h4>
        <Badge color="blue">{clients.length} pending</Badge>
      </div>
      
      {clients.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No new clients found matching your search.' : 'No new clients found'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader sortKey="name" currentSort={currentSort} onSort={handleSort}>
                Name
              </SortableHeader>
              <SortableHeader sortKey="email" currentSort={currentSort} onSort={handleSort}>
                Email
              </SortableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Pet</TableHeader>
              <SortableHeader sortKey="inquiry" currentSort={currentSort} onSort={handleSort}>
                Inquiry
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {client.name}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {client.email}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {client.phone}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {client.pet}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {client.inquiry}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function Consultation({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)
  
  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  const appointments = useMemo(() => {
    let filtered = [
      { time: '9:00 AM', customer: 'Sarah Johnson', pet: 'Max', type: 'Routine checkup', status: 'Confirmed' },
      { time: '10:30 AM', customer: 'Mike Chen', pet: 'Luna', type: 'Dental cleaning', status: 'Pending' },
      { time: '2:00 PM', customer: 'Emma Davis', pet: 'Charlie', type: 'Vaccination', status: 'Confirmed' },
      { time: '3:30 PM', customer: 'James Wilson', pet: 'Bella', type: 'Surgery consultation', status: 'Confirmed' },
      { time: '4:00 PM', customer: 'Anna Brown', pet: 'Mittens', type: 'Health checkup', status: 'Pending' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(appointment => 
        appointment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0
      
      switch (sortKey) {
        case 'customer':
          comparison = a.customer.localeCompare(b.customer)
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
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Consultation Schedule</h4>
        <Badge color="yellow">{appointments.length} appointments</Badge>
      </div>
      
      {appointments.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No appointments found matching your search.' : 'No appointments scheduled'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader sortKey="time" currentSort={currentSort} onSort={handleSort}>
                Time
              </SortableHeader>
              <SortableHeader sortKey="customer" currentSort={currentSort} onSort={handleSort}>
                Customer
              </SortableHeader>
              <TableHeader>Pet</TableHeader>
              <SortableHeader sortKey="type" currentSort={currentSort} onSort={handleSort}>
                Appointment Type
              </SortableHeader>
              <SortableHeader sortKey="status" currentSort={currentSort} onSort={handleSort}>
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
                    {appointment.customer}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {appointment.pet}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {appointment.type}
                </TableCell>
                <TableCell>
                  <Badge color={appointment.status === 'Confirmed' ? 'green' : 'yellow'}>
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

export function FollowUp({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)
  
  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  const followUps = useMemo(() => {
    let filtered = [
      { customer: 'Sarah Johnson', pet: 'Max', action: 'Check vaccination records', priority: 'High', dueDate: '2024-01-15' },
      { customer: 'Mike Chen', pet: 'Luna', action: 'Schedule dental follow-up', priority: 'Medium', dueDate: '2024-01-20' },
      { customer: 'Emma Davis', pet: 'Charlie', action: 'Review diet plan', priority: 'Low', dueDate: '2024-01-25' },
      { customer: 'Robert Taylor', pet: 'Buddy', action: 'Post-surgery check', priority: 'High', dueDate: '2024-01-12' },
      { customer: 'Jennifer Lee', pet: 'Mittens', action: 'Medication review', priority: 'Medium', dueDate: '2024-01-18' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.priority.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const isReverse = currentSort.startsWith('-')
      const sortKey = isReverse ? currentSort.substring(1) : currentSort
      let comparison = 0
      
      switch (sortKey) {
        case 'customer':
          comparison = a.customer.localeCompare(b.customer)
          break
        case 'priority':
          const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'action':
          comparison = a.action.localeCompare(b.action)
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
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Follow-up Required</h4>
        <Badge color="orange">{followUps.length} items</Badge>
      </div>
      
      {followUps.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No follow-ups found matching your search.' : 'No follow-ups required'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader sortKey="customer" currentSort={currentSort} onSort={handleSort}>
                Customer
              </SortableHeader>
              <TableHeader>Pet</TableHeader>
              <SortableHeader sortKey="action" currentSort={currentSort} onSort={handleSort}>
                Action Required
              </SortableHeader>
              <SortableHeader sortKey="priority" currentSort={currentSort} onSort={handleSort}>
                Priority
              </SortableHeader>
              <SortableHeader sortKey="dueDate" currentSort={currentSort} onSort={handleSort}>
                Due Date
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {followUps.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {item.customer}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {item.pet}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {item.action}
                </TableCell>
                <TableCell>
                  <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'zinc'}>
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {new Date(item.dueDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function Inactive({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const [currentSort, setCurrentSort] = useState(sortBy)
  
  const handleSort = (key: string) => {
    if (currentSort === key) {
      setCurrentSort(`-${key}`)
    } else {
      setCurrentSort(key)
    }
  }

  const inactiveCustomers = useMemo(() => {
    let filtered = [
      { name: 'Robert Taylor', pet: 'Buddy (Golden Retriever)', lastVisit: '6 months ago', email: 'robert.taylor@example.com', phone: '(555) 987-6543' },
      { name: 'Jennifer Lee', pet: 'Mittens (Tabby Cat)', lastVisit: '8 months ago', email: 'jennifer.lee@example.com', phone: '(555) 876-5432' },
      { name: 'David Wilson', pet: 'Rex (Doberman)', lastVisit: '1 year ago', email: 'david.wilson@example.com', phone: '(555) 765-4321' },
      { name: 'Patricia Garcia', pet: 'Snowball (Persian Cat)', lastVisit: '10 months ago', email: 'patricia.garcia@example.com', phone: '(555) 654-3210' },
      { name: 'Steven Martinez', pet: 'Zeus (Rottweiler)', lastVisit: '7 months ago', email: 'steven.martinez@example.com', phone: '(555) 543-2109' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'lastVisit':
          comparison = a.lastVisit.localeCompare(b.lastVisit)
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
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Inactive Customers</h4>
        <Badge color="zinc">{inactiveCustomers.length} customers</Badge>
      </div>
      
      {inactiveCustomers.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No inactive customers found matching your search.' : 'No inactive customers found'}
        </div>
      ) : (
        <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
          <TableHead>
            <TableRow>
              <SortableHeader sortKey="name" currentSort={currentSort} onSort={handleSort}>
                Customer
              </SortableHeader>
              <SortableHeader sortKey="email" currentSort={currentSort} onSort={handleSort}>
                Email
              </SortableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Pet</TableHeader>
              <SortableHeader sortKey="lastVisit" currentSort={currentSort} onSort={handleSort}>
                Last Visit
              </SortableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {inactiveCustomers.map((customer, index) => (
              <TableRow key={index} className="opacity-75">
                <TableCell>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {customer.name}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {customer.email}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {customer.phone}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {customer.pet}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {customer.lastVisit}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}