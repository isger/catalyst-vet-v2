'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ActiveCustomers, NewClients, Consultation, FollowUp, Inactive } from './customer-tabs'
import { Input, InputGroup } from '@/components/ui/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Select } from '@/components/ui/select'
import TabsV2, { Tab } from "@/components/ui/tabs-v2";
import { useState } from 'react'
import { useCustomerStats } from '@/hooks/use-customers'

export default function Customers() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { stats, loading: statsLoading } = useCustomerStats();

  const tabs: Tab[] = [
    { name: 'Active', value: 'active', count: statsLoading ? '...' : stats.active.toString() },
    { name: 'New Customers', value: 'new-customers', count: statsLoading ? '...' : stats.new.toString() },
    { name: 'Consultations', value: 'consultations', count: statsLoading ? '...' : stats.consultation.toString() },
    { name: 'Follow-up', value: 'follow-up', count: statsLoading ? '...' : stats.followUp.toString() },
    { name: 'Inactive', value: 'inactive', count: statsLoading ? '...' : stats.inactive.toString() },
  ];

  const renderTabContent = () => {
    const commonProps = { searchQuery, sortBy };
    
    switch (activeTab) {
      case 'active':
        return <ActiveCustomers {...commonProps} />
      case 'new-customers':
        return <NewClients {...commonProps} />
      case 'consultations':
        return <Consultation {...commonProps} />
      case 'follow-up':
        return <FollowUp {...commonProps} />
      case 'inactive':
        return <Inactive {...commonProps} />
      default:
        return <ActiveCustomers {...commonProps} />
    }
  };

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
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </>
  )
}
