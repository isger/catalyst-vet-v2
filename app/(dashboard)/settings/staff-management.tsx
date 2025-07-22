'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Heading, Subheading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { getStaffMembers, inviteStaffMember, removeStaffMember, updateStaffMemberRole } from '@/server/actions/staff'
import { useActionState } from 'react'
import { StaffMembersSkeleton } from './staff-members-skeleton'

interface StaffMember {
  id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

interface StaffManagementProps {
  userRole?: string
}

export function StaffManagement({ userRole }: StaffManagementProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  
  const [inviteState, inviteAction] = useActionState(inviteStaffMember, null)

  useEffect(() => {
    async function loadStaffMembers() {
      try {
        const members = await getStaffMembers()
        setStaffMembers(members)
      } catch (error) {
        console.error('Failed to load staff members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStaffMembers()
  }, [])

  const canManageStaff = userRole === 'owner' || userRole === 'admin'
  const canChangeRoles = userRole === 'owner'

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    
    try {
      await removeStaffMember(membershipId)
      setStaffMembers(prev => prev.filter(member => member.id !== membershipId))
    } catch (error) {
      console.error('Failed to remove staff member:', error)
    }
  }

  const handleRoleChange = async (membershipId: string, newRole: 'admin' | 'member') => {
    try {
      await updateStaffMemberRole(membershipId, newRole)
      setStaffMembers(prev => 
        prev.map(member => 
          member.id === membershipId 
            ? { ...member, role: newRole }
            : member
        )
      )
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'purple'
      case 'admin': return 'blue'
      case 'member': return 'gray'
      default: return 'gray'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Subheading>Staff Members</Subheading>
            <Text>Manage your practice staff and their permissions.</Text>
          </div>
          {canManageStaff && (
            <Button 
              disabled
              className="flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              Invite Staff Member
            </Button>
          )}
        </div>
        
        <StaffMembersSkeleton canManageStaff={canManageStaff} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Subheading>Staff Members</Subheading>
          <Text>Manage your practice staff and their permissions.</Text>
        </div>
        {canManageStaff && (
          <Button 
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Invite Staff Member
          </Button>
        )}
      </div>

      {showInviteForm && (
        <form action={inviteAction} className="rounded-lg border p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          <Heading level={3}>Invite New Staff Member</Heading>
          
          {inviteState?.error && (
            <div className="text-red-600 text-sm">{inviteState.error}</div>
          )}
          
          {inviteState?.success && (
            <div className="text-green-600 text-sm">{inviteState.message}</div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="staff@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Role
              </label>
              <Select name="role" defaultValue="member">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit">Send Invitation</Button>
            <Button 
              type="button" 
              plain 
              onClick={() => setShowInviteForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

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
            {staffMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.name || 'No name set'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canChangeRoles && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'member')}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <Badge color={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                {canManageStaff && (
                  <TableCell>
                    {member.role !== 'owner' && (
                      <Button
                        plain
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {staffMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No staff members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}