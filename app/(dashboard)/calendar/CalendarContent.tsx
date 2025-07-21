'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useCalendar } from './context/CalendarContext'
import StaffSelector from './components/StaffSelector'
import AppointmentModal from './components/AppointmentModal'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import YearView from './components/YearView'
import type { StaffMember } from '@/server/queries/appointments'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  animal?: Array<{
    id: string
    name: string
    species: string
    breed: string | null
  }>
}

interface AppointmentType {
  id: string
  name: string
  description: string | null
  duration: number
  color: string | null
  default_room_type: string | null
  requires_equipment: boolean | null
}

interface CalendarContentProps {
  staff: StaffMember[]
  customers: Customer[]
  appointmentTypes: AppointmentType[]
}

export default function CalendarContent({ staff, customers, appointmentTypes }: CalendarContentProps) {
  const {
    state: { currentView, isLoading, error },
    setView,
    navigateToToday,
    navigatePrevious,
    navigateNext,
    formatDateForView,
    openCreateModal,
  } = useCalendar()

  const getViewButtonText = () => {
    switch (currentView) {
      case 'day':
        return 'Day view'
      case 'week':
        return 'Week view'
      case 'month':
        return 'Month view'
      case 'year':
        return 'Year view'
      default:
        return 'Day view'
    }
  }

  const getNavigationLabel = () => {
    switch (currentView) {
      case 'week':
        return { prev: 'Previous week', next: 'Next week' }
      case 'month':
        return { prev: 'Previous month', next: 'Next month' }
      case 'year':
        return { prev: 'Previous year', next: 'Next year' }
      case 'day':
      default:
        return { prev: 'Previous day', next: 'Next day' }
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Error loading calendar
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="flex flex-none items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {formatDateForView()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation Controls */}
            <div className="relative flex items-center rounded-md bg-white dark:bg-gray-800 shadow-xs md:items-stretch">
              <button
                type="button"
                onClick={navigatePrevious}
                className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 dark:border-gray-600 pr-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50 dark:md:hover:bg-gray-700"
              >
                <span className="sr-only">{getNavigationLabel().prev}</span>
                <ChevronLeftIcon className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={navigateToToday}
                className="hidden border-y border-gray-300 dark:border-gray-600 px-3.5 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:relative md:block"
              >
                Today
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 dark:bg-gray-600 md:hidden" />
              <button
                type="button"
                onClick={navigateNext}
                className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 dark:border-gray-600 pl-1 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50 dark:md:hover:bg-gray-700"
              >
                <span className="sr-only">{getNavigationLabel().next}</span>
                <ChevronRightIcon className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Staff Selector */}
            <StaffSelector staff={staff} />
            
            {/* View Selector */}
            <div className="hidden md:flex md:items-center">
              <Menu as="div" className="relative">
                <MenuButton
                  type="button"
                  className="flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {getViewButtonText()}
                  <ChevronDownIcon className="-mr-1 size-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="py-1">
                    <MenuItem>
                      <button
                        onClick={() => setView('day')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                      >
                        Day view
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setView('week')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                      >
                        Week view
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setView('month')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                      >
                        Month view
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => setView('year')}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                      >
                        Year view
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
              
              <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-gray-600" />
              
              <button
                type="button"
                onClick={() => openCreateModal()}
                className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-1"
              >
                <PlusIcon className="size-4" aria-hidden="true" />
                Add Appointment
              </button>
            </div>

            {/* Mobile Menu */}
            <Menu as="div" className="relative ml-6 md:hidden">
              <MenuButton className="relative flex items-center rounded-full border border-transparent text-gray-400 dark:text-gray-300 outline-offset-8 hover:text-gray-500 dark:hover:text-gray-400">
                <span className="absolute -inset-2" />
                <span className="sr-only">Open menu</span>
                <EllipsisHorizontalIcon className="size-5" aria-hidden="true" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={() => openCreateModal()}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Create Appointment
                    </button>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={navigateToToday}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Go to today
                    </button>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={() => setView('day')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Day view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setView('week')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Week view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setView('month')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Month view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => setView('year')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-gray-700 data-focus:text-gray-900 dark:data-focus:text-gray-100 data-focus:outline-hidden"
                    >
                      Year view
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </header>
      
        <div className="flex-1 overflow-hidden">
          <div className="h-full transform transition-all duration-200 ease-in-out">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <>
                {currentView === 'day' && <DayView />}
                {currentView === 'week' && <WeekView />}
                {currentView === 'month' && <MonthView />}
                {currentView === 'year' && <YearView />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal staff={staff} customers={customers} appointmentTypes={appointmentTypes} />
    </>
  )
}