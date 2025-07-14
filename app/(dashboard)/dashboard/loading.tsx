import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardPageLoading() {
  return (
    <>
      {/* Header with sign out button */}
      <div className="md:flex md:items-center md:justify-between mb-2">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      
      {/* Main card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}