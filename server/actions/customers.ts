'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveCustomers } from '@/server/queries/customers'
import type { PaginationParams, PaginatedResult, CustomerWithPets } from '@/server/queries/customers'

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
})

const updateCustomerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: addressSchema.optional(),
  additional_notes: z.string().optional(),
})

export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>

export async function fetchPaginatedCustomers(params: PaginationParams): Promise<PaginatedResult<CustomerWithPets>> {
  return await getActiveCustomers(params)
}

export async function updateCustomer(customerId: string, data: UpdateCustomerData) {
  const supabase = await createClient()

  // Get current user to verify tenant access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get user's tenant
  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!tenantData) {
    return { error: 'Unauthorized' }
  }

  // Validate input data
  const validationResult = updateCustomerSchema.safeParse(data)
  if (!validationResult.success) {
    return { error: 'Invalid data', details: validationResult.error.format() }
  }

  // Verify customer belongs to user's tenant
  const { data: existingCustomer } = await supabase
    .from('owner')
    .select('id')
    .eq('id', customerId)
    .eq('tenant_id', tenantData.tenant_id)
    .single()

  if (!existingCustomer) {
    return { error: 'Customer not found' }
  }

  // Update customer
  const { error } = await supabase
    .from('owner')
    .update({
      first_name: validationResult.data.first_name,
      last_name: validationResult.data.last_name,
      email: validationResult.data.email,
      phone: validationResult.data.phone,
      address: validationResult.data.address,
      additional_notes: validationResult.data.additional_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .eq('tenant_id', tenantData.tenant_id)

  if (error) {
    console.error('Error updating customer:', error)
    return { error: 'Failed to update customer' }
  }

  // Revalidate the customer page
  revalidatePath(`/customers/${customerId}`)
  revalidatePath('/customers')

  return { success: true }
}