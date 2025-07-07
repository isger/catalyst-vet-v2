'use client'

import { Badge } from '@/components/ui/badge'
import { useMemo } from 'react'
import { useActiveCustomers } from '@/hooks/use-customers'

interface TabProps {
  searchQuery?: string;
  sortBy?: string;
}


export function ActiveCustomers({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const { customers: allCustomers, loading, error } = useActiveCustomers()

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = allCustomers

    // Filter by search query
    if (searchQuery) {
      filtered = allCustomers.filter(customer => 
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.patients.some(pet => pet.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort customers
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'status':
          return (a.lastVisit || '').localeCompare(b.lastVisit || '')
        case 'date':
          return new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime()
        default:
          return 0
      }
    })
  }, [allCustomers, searchQuery, sortBy])
  
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Active Customers</h4>
          <Badge color="green">Loading...</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded mb-1"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </div>
          ))}
        </div>
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
        <Badge color="green">{filteredAndSortedCustomers.length} customers</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedCustomers.map((customer) => (
          <div key={customer.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">
              {customer.firstName} {customer.lastName}
            </h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatPets(customer.patients)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Last visit: {formatLastVisit(customer.lastVisit)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {customer.email}
            </p>
          </div>
        ))}
      </div>
      {filteredAndSortedCustomers.length === 0 && !loading && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No customers found matching your search.' : 'No active customers found'}
        </div>
      )}
    </div>
  )
}

export function NewClients({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const clients = useMemo(() => {
    let filtered = [
      { name: 'Alex Rodriguez', pet: 'Bella (Labrador)', inquiry: 'Vaccination schedule' },
      { name: 'Lisa Park', pet: 'Whiskers (Maine Coon)', inquiry: 'Health checkup' },
      { name: 'John Smith', pet: 'Rocky (German Shepherd)', inquiry: 'Training consultation' },
      { name: 'Maria Garcia', pet: 'Fluffy (Persian Cat)', inquiry: 'Grooming consultation' },
      { name: 'David Kim', pet: 'Buddy (Golden Retriever)', inquiry: 'Behavioral training' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.inquiry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [searchQuery, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">New Clients</h4>
        <Badge color="blue">{clients.length} pending</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">{client.name}</h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{client.pet}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Inquiry: {client.inquiry}</p>
          </div>
        ))}
      </div>
      {clients.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No new clients found matching your search.' : 'No new clients found'}
        </div>
      )}
    </div>
  )
}

export function Consultation({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const appointments = useMemo(() => {
    let filtered = [
      { time: '9:00 AM', customer: 'Sarah Johnson', pet: 'Max', type: 'Routine checkup' },
      { time: '10:30 AM', customer: 'Mike Chen', pet: 'Luna', type: 'Dental cleaning' },
      { time: '2:00 PM', customer: 'Emma Davis', pet: 'Charlie', type: 'Vaccination' },
      { time: '3:30 PM', customer: 'James Wilson', pet: 'Bella', type: 'Surgery consultation' },
      { time: '4:00 PM', customer: 'Anna Brown', pet: 'Mittens', type: 'Health checkup' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(appointment => 
        appointment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customer.localeCompare(b.customer)
        case 'date':
          return a.time.localeCompare(b.time)
        default:
          return 0
      }
    })
  }, [searchQuery, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Consultation Schedule</h4>
        <Badge color="yellow">{appointments.length} appointments</Badge>
      </div>
      <div className="space-y-3">
        {appointments.map((appointment, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div>
              <p className="font-medium text-zinc-950 dark:text-white">{appointment.customer}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{appointment.pet} - {appointment.type}</p>
            </div>
            <Badge color="amber">{appointment.time}</Badge>
          </div>
        ))}
      </div>
      {appointments.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No appointments found matching your search.' : 'No appointments scheduled'}
        </div>
      )}
    </div>
  )
}

export function FollowUp({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const followUps = useMemo(() => {
    let filtered = [
      { customer: 'Sarah Johnson', pet: 'Max', action: 'Check vaccination records', priority: 'High' },
      { customer: 'Mike Chen', pet: 'Luna', action: 'Schedule dental follow-up', priority: 'Medium' },
      { customer: 'Emma Davis', pet: 'Charlie', action: 'Review diet plan', priority: 'Low' },
      { customer: 'Robert Taylor', pet: 'Buddy', action: 'Post-surgery check', priority: 'High' },
      { customer: 'Jennifer Lee', pet: 'Mittens', action: 'Medication review', priority: 'Medium' },
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
      switch (sortBy) {
        case 'name':
          return a.customer.localeCompare(b.customer)
        case 'status':
          const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return 0
      }
    })
  }, [searchQuery, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Follow-up Required</h4>
        <Badge color="orange">{followUps.length} items</Badge>
      </div>
      <div className="space-y-3">
        {followUps.map((item, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-950 dark:text-white">{item.customer}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.pet}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{item.action}</p>
              </div>
              <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'zinc'}>
                {item.priority}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {followUps.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No follow-ups found matching your search.' : 'No follow-ups required'}
        </div>
      )}
    </div>
  )
}

export function Inactive({ searchQuery = '', sortBy = 'name' }: TabProps) {
  const inactiveCustomers = useMemo(() => {
    let filtered = [
      { name: 'Robert Taylor', pet: 'Buddy (Golden Retriever)', lastVisit: '6 months ago' },
      { name: 'Jennifer Lee', pet: 'Mittens (Tabby Cat)', lastVisit: '8 months ago' },
      { name: 'David Wilson', pet: 'Rex (Doberman)', lastVisit: '1 year ago' },
      { name: 'Patricia Garcia', pet: 'Snowball (Persian Cat)', lastVisit: '10 months ago' },
      { name: 'Steven Martinez', pet: 'Zeus (Rottweiler)', lastVisit: '7 months ago' },
    ]

    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.pet.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return a.lastVisit.localeCompare(b.lastVisit)
        default:
          return 0
      }
    })
  }, [searchQuery, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Inactive Customers</h4>
        <Badge color="zinc">{inactiveCustomers.length} customers</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inactiveCustomers.map((customer, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 opacity-75 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">{customer.name}</h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{customer.pet}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Last visit: {customer.lastVisit}</p>
          </div>
        ))}
      </div>
      {inactiveCustomers.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {searchQuery ? 'No inactive customers found matching your search.' : 'No inactive customers found'}
        </div>
      )}
    </div>
  )
}