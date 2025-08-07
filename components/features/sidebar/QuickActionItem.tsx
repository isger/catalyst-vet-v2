'use client'

import { SidebarItem, SidebarLabel } from '@/components/ui/sidebar'
import { useAnimalSearch } from '@/components/features/animals/AnimalSearchProvider'
import type { QuickAction } from '@/data'
import { useRouter } from 'next/navigation'

// Helper function to get icon component by name
function getIconComponent(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CalendarDaysIcon, UserPlusIcon, BeakerIcon, MagnifyingGlassIcon, CalendarIcon } = require('@heroicons/react/20/solid')
  
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    CalendarPlusIcon: CalendarDaysIcon,
    UserPlusIcon: UserPlusIcon,
    BeakerIcon: BeakerIcon,
    MagnifyingGlassIcon: MagnifyingGlassIcon,
  }
  return icons[iconName] || CalendarIcon
}

interface QuickActionItemProps {
  action: QuickAction
}

export function QuickActionItem({ action }: QuickActionItemProps) {
  const { openAnimalSearch } = useAnimalSearch()
  const router = useRouter()
  
  const IconComponent = getIconComponent(action.icon)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (action.action === 'search-animal') {
      openAnimalSearch()
    } else if (action.url) {
      router.push(action.url)
    }
  }

  if (action.action) {
    return (
      <SidebarItem onClick={handleClick} className="cursor-pointer">
        <IconComponent />
        <SidebarLabel>{action.name}</SidebarLabel>
      </SidebarItem>
    )
  }

  return (
    <SidebarItem href={action.url}>
      <IconComponent />
      <SidebarLabel>{action.name}</SidebarLabel>
    </SidebarItem>
  )
}