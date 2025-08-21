'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentTenantId } from '@/lib/tenant/current-user'

export type AnimalFormData = {
  name: string
  species: string
  breed?: string
  color?: string
  gender?: string
  date_of_birth?: string
  weight_kg?: number
  microchip_id?: string
  insurance_provider?: string
  insurance_policy_number?: string
  behavioral_notes?: string
  dietary_requirements?: string
}

export async function updateAnimal(id: string, formData: AnimalFormData) {
  const supabase = await createClient()

  // Get user's tenant information using helper (throws if no app_metadata)
  const tenantId = await getCurrentTenantId()

  // First verify the animal belongs to this tenant
  const { data: existingAnimal } = await supabase
    .from('animal')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!existingAnimal) {
    throw new Error('Animal not found or access denied')
  }

  // Update the animal
  const { error } = await supabase
    .from('animal')
    .update({
      name: formData.name,
      species: formData.species,
      breed: formData.breed || null,
      color: formData.color || null,
      gender: formData.gender || null,
      date_of_birth: formData.date_of_birth || null,
      weight_kg: formData.weight_kg || null,
      microchip_id: formData.microchip_id || null,
      insurance_provider: formData.insurance_provider || null,
      insurance_policy_number: formData.insurance_policy_number || null,
      behavioral_notes: formData.behavioral_notes || null,
      dietary_requirements: formData.dietary_requirements || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating animal:', error)
    throw new Error('Failed to update animal')
  }

  // Revalidate the animal page
  revalidatePath(`/animals/${id}`)
  revalidatePath('/animals')
}