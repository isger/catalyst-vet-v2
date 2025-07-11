'use client'

import { useState } from 'react'
import { Input, InputGroup } from '@/components/ui/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Select } from '@/components/ui/select'
import TabsV2, { Tab } from '@/components/ui/tabs-v2'
import {
  AllAnimals,
  BySpecies,
  RecentAdditions,
  MedicalAlerts,
  UpcomingAppointments,
} from './animal-tabs'
import type { PaginatedAnimalsResult, AnimalStats } from '@/server/queries/animals'

interface AnimalPageClientProps {
  initialAnimals: PaginatedAnimalsResult
  stats: AnimalStats
}

export default function AnimalPageClient({
  initialAnimals,
  stats,
}: AnimalPageClientProps) {
  const [activeTab, setActiveTab] = useState('all-animals')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const tabs: Tab[] = [
    { name: 'All Animals', value: 'all-animals', count: stats.totalAnimals.toString() },
    {
      name: 'By Species',
      value: 'by-species',
      count: stats.totalSpecies.toString(),
    },
    {
      name: 'Recent Additions',
      value: 'recent-additions',
      count: stats.recentAnimals.toString(),
    },
    {
      name: 'Medical Alerts',
      value: 'medical-alerts',
      count: '5', // Mock count - would come from API in production
    },
    {
      name: 'Appointments',
      value: 'appointments',
      count: '3', // Mock count - would come from API in production
    },
  ]

  const renderTabContent = () => {
    const commonProps = { searchQuery, sortBy }

    switch (activeTab) {
      case 'all-animals':
        return <AllAnimals {...commonProps} initialData={initialAnimals} onSearchChange={setSearchQuery} />
      case 'by-species':
        return <BySpecies {...commonProps} />
      case 'recent-additions':
        return <RecentAdditions {...commonProps} />
      case 'medical-alerts':
        return <MedicalAlerts {...commonProps} />
      case 'appointments':
        return <UpcomingAppointments {...commonProps} />
      default:
        return <AllAnimals {...commonProps} initialData={initialAnimals} onSearchChange={setSearchQuery} />
    }
  }

  return (
    <div className="mt-8">
      <TabsV2
        tabs={tabs}
        defaultValue="all-animals"
        onTabChange={setActiveTab}
      />

      <div className="my-6 flex max-w-xl gap-4">
        <div className="flex-1">
          <InputGroup>
            <MagnifyingGlassIcon />
            <Input
              name="search"
              placeholder="Search animals…"
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
            <option value="species">Sort by species</option>
            <option value="age">Sort by age</option>
            <option value="dateAdded">Sort by date added</option>
          </Select>
        </div>
      </div>

      <div className="mt-6">{renderTabContent()}</div>
    </div>
  )
}