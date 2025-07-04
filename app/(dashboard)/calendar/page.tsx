'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import YearView from './components/YearView'

type CalendarView = 'day' | 'week' | 'month' | 'year'

export default function Calendar() {
  const [currentView, setCurrentView] = useState<CalendarView>('day')

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

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'week':
        return 'January 2022'
      case 'month':
        return (
          <time dateTime="2022-01">January 2022</time>
        )
      case 'year':
        return (
          <time dateTime="2022">2022</time>
        )
      case 'day':
      default:
        return (
          <>
            <time dateTime="2022-01-22" className="sm:hidden">
              Jan 22, 2022
            </time>
            <time dateTime="2022-01-22" className="hidden sm:inline">
              January 22, 2022
            </time>
          </>
        )
    }
  }

  const getHeaderSubtitle = () => {
    if (currentView === 'day') {
      return <p className="mt-1 text-sm text-gray-500">Saturday</p>
    }
    return null
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

  const handleViewChange = (view: CalendarView) => {
    if (view === currentView) return
    
    setCurrentView(view)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-gray-100">
            {getHeaderTitle()}
          </h1>
          {getHeaderSubtitle()}
        </div>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-xs md:items-stretch">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">{getNavigationLabel().prev}</span>
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">{getNavigationLabel().next}</span>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <MenuButton
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                {getViewButtonText()}
                <ChevronDownIcon className="-mr-1 size-5 text-gray-400" aria-hidden="true" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={() => handleViewChange('day')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                    >
                      Day view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => handleViewChange('week')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                    >
                      Week view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => handleViewChange('month')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                    >
                      Month view
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={() => handleViewChange('year')}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                    >
                      Year view
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add event
            </button>
          </div>
          <Menu as="div" className="relative ml-6 md:hidden">
            <MenuButton className="relative flex items-center rounded-full border border-transparent text-gray-400 outline-offset-8 hover:text-gray-500">
              <span className="absolute -inset-2" />
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="size-5" aria-hidden="true" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Create event
                  </a>
                </MenuItem>
              </div>
              <div className="py-1">
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Go to today
                  </a>
                </MenuItem>
              </div>
              <div className="py-1">
                <MenuItem>
                  <button
                    onClick={() => handleViewChange('day')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Day view
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => handleViewChange('week')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Week view
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => handleViewChange('month')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Month view
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => handleViewChange('year')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
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
          {currentView === 'day' && <DayView />}
          {currentView === 'week' && <WeekView />}
          {currentView === 'month' && <MonthView />}
          {currentView === 'year' && <YearView />}
        </div>
      </div>
    </div>
  )
}