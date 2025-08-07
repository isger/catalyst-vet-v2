'use client'

import { useState } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { UserIcon } from '@heroicons/react/24/outline'
import type { StaffMember } from '@/server/queries/appointments'

interface StaffSelectionComboboxProps {
  staff: StaffMember[]
  selectedStaffIds: string[]
  onSelectionChange: (staffIds: string[]) => void
  label?: string
  error?: string
  disabled?: boolean
}

export default function StaffSelectionCombobox({
  staff,
  selectedStaffIds,
  onSelectionChange,
  label = 'Assigned Staff',
  error,
  disabled = false
}: StaffSelectionComboboxProps) {
  const [query, setQuery] = useState('')

  // Get selected staff members
  const selectedStaff = staff.filter(member => selectedStaffIds.includes(member.id))

  // Filter staff based on query
  const filteredStaff = query === ''
    ? staff
    : staff.filter((member) =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
        member.role.toLowerCase().includes(query.toLowerCase())
      )

  // Handle selecting a staff member
  const handleStaffSelect = (member: StaffMember) => {
    if (selectedStaffIds.includes(member.id)) {
      // Remove if already selected
      onSelectionChange(selectedStaffIds.filter(id => id !== member.id))
    } else {
      // Add if not selected
      onSelectionChange([...selectedStaffIds, member.id])
    }
    setQuery('') // Clear search after selection
  }

  // Handle removing a selected staff member
  const handleRemoveStaff = (staffId: string) => {
    onSelectionChange(selectedStaffIds.filter(id => id !== staffId))
  }

  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </label>
      
      {/* Selected staff tags */}
      {selectedStaff.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedStaff.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-300/10"
            >
              {member.first_name} {member.last_name}
              <button
                type="button"
                onClick={() => handleRemoveStaff(member.id)}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-800 dark:hover:text-indigo-300 focus:outline-hidden focus:bg-indigo-200 focus:text-indigo-500 dark:focus:bg-indigo-800 dark:focus:text-indigo-300"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Combobox
        as="div"
        value={null}
        onChange={(value: StaffMember | null) => {
          if (value) {
            handleStaffSelect(value)
          }
        }}
        disabled={disabled}
      >
        <div className="relative">
          <ComboboxInput
            className={`block w-full rounded-md bg-white dark:bg-gray-800 py-1.5 pr-10 pl-10 text-base text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm/6 ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={selectedStaff.length > 0 ? 'Add more staff...' : 'Search staff members...'}
            value={query}
          />
          
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <UserIcon className="size-5 text-gray-400" aria-hidden="true" />
          </div>

          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
            <ChevronDownIcon className="size-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          <ComboboxOptions
            transition
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
          >
            {filteredStaff.length === 0 && query !== '' && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No staff found for &quot;{query}&quot;
              </div>
            )}

            {filteredStaff.map((member) => (
              <ComboboxOption
                key={member.id}
                value={member}
                className="group cursor-default px-3 py-2 text-gray-900 dark:text-gray-100 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="size-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: member.color || '#6b7280' }}
                    />
                    <div>
                      <div className="font-medium group-data-[focus]:text-white">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500 group-data-[focus]:text-white/80">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  {selectedStaffIds.includes(member.id) && (
                    <div className="text-indigo-600 group-data-[focus]:text-white">
                      <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}