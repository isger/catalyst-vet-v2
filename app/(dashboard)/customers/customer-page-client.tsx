'use client'

import { useState } from 'react'
import { Input, InputGroup } from '@/components/ui/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Select } from '@/components/ui/select'
import TabsV2, { Tab } from '@/components/ui/tabs-v2'
import {
  ActiveCustomers,
  NewClients,
  Consultation,
  FollowUp,
  Inactive,
} from './customer-tabs'
import type {
  CustomerWithPets,
  PaginatedResult,
} from '@/server/queries/customers'

interface CustomerPageClientProps {
  initialCustomers: PaginatedResult<CustomerWithPets>
  stats: {
    active: number
    new: number
    consultation: number
    followUp: number
    inactive: number
  }
}

export default function CustomerPageClient({
  initialCustomers,
  stats,
}: CustomerPageClientProps) {
  const [activeTab, setActiveTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const tabs: Tab[] = [
    { name: 'Active', value: 'active', count: stats.active.toString() },
    {
      name: 'New Customers',
      value: 'new-customers',
      count: stats.new.toString(),
    },
    {
      name: 'Consultations',
      value: 'consultations',
      count: stats.consultation.toString(),
    },
    {
      name: 'Follow-up',
      value: 'follow-up',
      count: stats.followUp.toString(),
    },
    {
      name: 'Inactive',
      value: 'inactive',
      count: stats.inactive.toString(),
    },
  ]

  const renderTabContent = () => {
    const commonProps = { searchQuery, sortBy }

    switch (activeTab) {
      case 'active':
        return <ActiveCustomers {...commonProps} initialData={initialCustomers} />
      case 'new-customers':
        return <NewClients {...commonProps} />
      case 'consultations':
        return <Consultation {...commonProps} />
      case 'follow-up':
        return <FollowUp {...commonProps} />
      case 'inactive':
        return <Inactive {...commonProps} />
      default:
        return <ActiveCustomers {...commonProps} initialData={initialCustomers} />
    }
  }

  return (
    <div className="mt-8">
      <TabsV2
        tabs={tabs}
        defaultValue="active"
        onTabChange={setActiveTab}
      />

      <div className="my-6 flex max-w-xl gap-4">
        <div className="flex-1">
          <InputGroup>
            <MagnifyingGlassIcon />
            <Input
              name="search"
              placeholder="Search customers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>
        <div>
          <Select
            name="sort_by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by name</option>
            <option value="status">Sort by status</option>
            <option value="date">Sort by date</option>
          </Select>
        </div>
      </div>

      <div className="mt-6">{renderTabContent()}</div>
    </div>
  )
}
