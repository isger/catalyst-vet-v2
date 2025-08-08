'use client'

import { useRouter } from 'next/navigation'
import TabsV2, { Tab } from '@/components/ui/tabs-v2'

interface AnimalDetailClientProps {
  animalId: string
  activeTab: string
  tabs: Tab[]
}

export function AnimalDetailClient({ animalId, activeTab, tabs }: AnimalDetailClientProps) {
  const router = useRouter()

  const handleTabChange = (value: string) => {
    const url = new URL(`/animals/${animalId}`, window.location.origin)
    if (value !== 'basic-info') {
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