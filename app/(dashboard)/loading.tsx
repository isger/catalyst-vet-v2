import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="md:flex md:items-center md:justify-between mb-2">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Main content skeleton */}
      <div className="grid gap-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}