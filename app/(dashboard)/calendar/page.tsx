import { Suspense } from 'react'
import CalendarWrapper from './CalendarWrapper'

// Loading component
function CalendarSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden animate-pulse">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="flex items-center gap-4">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

export default function Calendar() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarWrapper />
    </Suspense>
  )
}