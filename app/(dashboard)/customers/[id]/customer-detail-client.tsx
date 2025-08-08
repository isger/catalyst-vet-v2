'use client'

import { useRouter } from 'next/navigation'
import TabsV2, { Tab } from '@/components/ui/tabs-v2'

interface CustomerDetailClientProps {
  customerId: string
  activeTab: string
  tabs: Tab[]
}

export function CustomerDetailClient({ customerId, activeTab, tabs }: CustomerDetailClientProps) {
  const router = useRouter()

  const handleTabChange = (value: string) => {
    const url = new URL(`/customers/${customerId}`, window.location.origin)
    if (value !== 'customer-info') {
      url.searchParams.set('tab', value)
    }
    router.push(url.pathname + url.search)
  }

  return (
    <TabsV2
      tabs={tabs}
      defaultValue={activeTab}
      onTabChange={handleTabChange}
    />
  )
}