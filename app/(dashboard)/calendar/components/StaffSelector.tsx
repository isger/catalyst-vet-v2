'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon, UserGroupIcon, UserIcon, CheckIcon } from '@heroicons/react/20/solid'
import { useCalendar } from '../context/CalendarContext'
import type { StaffMember } from '@/server/queries/appointments'

interface StaffColorIndicatorProps {
  color: string | null
  size?: 'sm' | 'md'
}

function StaffColorIndicator({ color, size = 'md' }: StaffColorIndicatorProps) {
  const sizeClasses = size === 'sm' ? 'size-3' : 'size-4'
  const defaultColor = '#6366f1' // indigo-500

  return (
    <div
      className={`${sizeClasses} rounded-full border border-gray-300 dark:border-gray-600`}
      style={{ backgroundColor: color || defaultColor }}
      aria-hidden="true"
    />
  )
}

interface StaffSelectorProps {
  staff: StaffMember[]
  className?: string
}

export default function StaffSelector({ staff, className = '' }: StaffSelectorProps) {
  const {
    state: { selectedStaffIds, showAllStaff },
    toggleStaffSelection,
    selectAllStaff,
    deselectAllStaff,
  } = useCalendar()

  const getDisplayText = () => {
    if (showAllStaff || selectedStaffIds.length === 0) {
      return 'All Staff'
    }
    
    if (selectedStaffIds.length === 1) {
      const staffMember = staff.find(s => s.id === selectedStaffIds[0])
      return staffMember ? `${staffMember.first_name} ${staffMember.last_name}` : 'Unknown Staff'
    }
    
    return `${selectedStaffIds.length} Staff Members`
  }

  const getDisplayIcon = () => {
    if (showAllStaff || selectedStaffIds.length === 0 || selectedStaffIds.length > 1) {
      return <UserGroupIcon className="size-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
    }
    
    const staffMember = staff.find(s => s.id === selectedStaffIds[0])
    if (staffMember?.color) {
      return <StaffColorIndicator color={staffMember.color} />
    }
    
    return <UserIcon className="size-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
  }

  const handleToggleAll = () => {
    if (showAllStaff) {
      deselectAllStaff()
    } else {
      selectAllStaff()
    }
  }

  const isStaffSelected = (staffId: string) => {
    return showAllStaff || selectedStaffIds.includes(staffId)
  }

  if (staff.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        <UserGroupIcon className="size-5" aria-hidden="true" />
        No staff available
      </div>
    )
  }

  return (
    <Menu as="div" className={`relative ${className}`}>
      <MenuButton className="flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500">
        {getDisplayIcon()}
        <span className="hidden sm:inline">{getDisplayText()}</span>
        <span className="sm:hidden">Staff</span>
        <ChevronDownIcon className="-mr-1 size-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-20 mt-2 w-72 origin-top-right overflow-hidden rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="p-2">
          {/* Header */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-600 mb-2">
            Staff Selection
          </div>

          {/* All Staff Toggle */}
          <MenuItem>
            <button
              onClick={handleToggleAll}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100"
            >
              <div className="flex items-center justify-center size-5">
                {showAllStaff && (
                  <CheckIcon className="size-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                )}
              </div>
              <UserGroupIcon className="size-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
              <span className="flex-1 text-left font-medium">All Staff</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {staff.length} members
              </span>
            </button>
          </MenuItem>

          {/* Divider */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-600" />

          {/* Individual Staff Members */}
          <div className="max-h-60 overflow-y-auto">
            {staff.map((staffMember) => (
              <MenuItem key={staffMember.id}>
                <button
                  onClick={() => toggleStaffSelection(staffMember.id)}
                  className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100"
                >
                  <div className="flex items-center justify-center size-5">
                    {isStaffSelected(staffMember.id) && (
                      <CheckIcon className="size-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    )}
                  </div>
                  <StaffColorIndicator color={staffMember.color} size="sm" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {staffMember.first_name} {staffMember.last_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {staffMember.role}
                    </div>
                  </div>
                </button>
              </MenuItem>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-2 border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedStaffIds.length === 0 || showAllStaff 
                ? `Showing all ${staff.length} staff members`
                : `Showing ${selectedStaffIds.length} of ${staff.length} staff members`
              }
            </div>
          </div>
        </div>
      </MenuItems>
    </Menu>
  )
}

// Compact version for mobile
export function StaffSelectorCompact({ staff, className = '' }: StaffSelectorProps) {
  const {
    state: { selectedStaffIds, showAllStaff },
    toggleStaffSelection,
  } = useCalendar()

  if (staff.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {staff.map((staffMember) => {
        const isSelected = showAllStaff || selectedStaffIds.includes(staffMember.id)
        
        return (
          <button
            key={staffMember.id}
            onClick={() => toggleStaffSelection(staffMember.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isSelected
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-pressed={isSelected}
          >
            <StaffColorIndicator color={staffMember.color} size="sm" />
            <span className="hidden sm:inline">
              {staffMember.first_name} {staffMember.last_name}
            </span>
            <span className="sm:hidden">
              {staffMember.first_name.charAt(0)}{staffMember.last_name.charAt(0)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Staff legend for calendar views
export function StaffLegend({ staff, className = '' }: StaffSelectorProps) {
  const {
    state: { selectedStaffIds, showAllStaff },
  } = useCalendar()

  const visibleStaff = showAllStaff 
    ? staff 
    : staff.filter(s => selectedStaffIds.includes(s.id))

  if (visibleStaff.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Staff Legend
      </h3>
      <div className="space-y-1">
        {visibleStaff.map((staffMember) => (
          <div key={staffMember.id} className="flex items-center gap-2 text-sm">
            <StaffColorIndicator color={staffMember.color} size="sm" />
            <span className="text-gray-700 dark:text-gray-300">
              {staffMember.first_name} {staffMember.last_name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              ({staffMember.role})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}