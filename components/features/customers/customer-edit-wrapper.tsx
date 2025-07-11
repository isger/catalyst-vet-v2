'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EditCustomerForm } from './edit-customer-form'
import type { CustomerWithPets } from '@/server/queries/customers'

interface CustomerEditWrapperProps {
  customer: CustomerWithPets
  customerId: string
  isEditMode: boolean
  currentSearchParams: URLSearchParams
}

export function CustomerEditWrapper({ 
  customer, 
  customerId, 
  isEditMode, 
  currentSearchParams 
}: CustomerEditWrapperProps) {
  const router = useRouter()

  const handleEditClick = () => {
    const newSearchParams = new URLSearchParams(currentSearchParams)
    newSearchParams.set('edit', 'true')
    router.push(`/customers/${customerId}?${newSearchParams.toString()}`)
  }

  const handleCancelEdit = () => {
    const newSearchParams = new URLSearchParams(currentSearchParams)
    newSearchParams.delete('edit')
    router.push(`/customers/${customerId}?${newSearchParams.toString()}`)
  }

  const handleSuccessEdit = () => {
    const newSearchParams = new URLSearchParams(currentSearchParams)
    newSearchParams.delete('edit')
    router.push(`/customers/${customerId}?${newSearchParams.toString()}`)
  }

  if (isEditMode) {
    return (
      <EditCustomerForm
        customer={customer}
        onCancel={handleCancelEdit}
        onSuccess={handleSuccessEdit}
      />
    )
  }

  return (
    <Button outline onClick={handleEditClick}>
      Edit Customer
    </Button>
  )
}