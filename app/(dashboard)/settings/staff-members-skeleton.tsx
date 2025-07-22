import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table'

interface StaffMembersSkeletonProps {
  canManageStaff?: boolean
}

export function StaffMembersSkeleton({ canManageStaff = false }: StaffMembersSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Staff Member</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Joined</TableHeader>
            {canManageStaff && <TableHeader>Actions</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[60px] rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              {canManageStaff && (
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}