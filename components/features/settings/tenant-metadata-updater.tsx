'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { updateUserTenantId } from '@/server/actions/auth'

interface TenantMetadataUpdaterProps {
  currentTenantId?: string
  hasAppMetadata: boolean
}

export function TenantMetadataUpdater({ currentTenantId, hasAppMetadata }: TenantMetadataUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateTenantId = async () => {
    setIsUpdating(true)
    
    try {
      const result = await updateUserTenantId('30827d13-561a-49e1-b9b0-84d52b1746e0')
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result?.success) {
        toast({
          title: 'Success',
          description: 'Tenant ID has been set in your account metadata. You may need to refresh the page.',
        })
        // Refresh the page to see the updated metadata
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tenant ID',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Don't show if user already has proper app metadata
  if (hasAppMetadata) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800">Setup Required</CardTitle>
        <CardDescription className="text-amber-700">
          Your account needs to be configured for multi-tenant access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-amber-800">
            This will set your tenant ID to: <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">30827d13-561a-49e1-b9b0-84d52b1746e0</code>
          </p>
          <Button 
            onClick={handleUpdateTenantId}
            disabled={isUpdating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isUpdating ? 'Setting up...' : 'Set Tenant ID'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}