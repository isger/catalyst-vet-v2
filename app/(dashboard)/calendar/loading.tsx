import { Skeleton } from '@/components/ui/skeleton'

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
      
      {/* Calendar navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-20" />
      </div>
      
      {/* Calendar grid */}
      <div className="border rounded-lg">
        {/* Calendar header */}
        <div className="grid grid-cols-7 border-b">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 border-r last:border-r-0">
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
        
        {/* Calendar body */}
        {Array.from({ length: 5 }).map((_, week) => (
          <div key={week} className="grid grid-cols-7 border-b last:border-b-0">
            {Array.from({ length: 7 }).map((_, day) => (
              <div key={day} className="p-4 h-32 border-r last:border-r-0">
                <Skeleton className="h-4 w-6 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}