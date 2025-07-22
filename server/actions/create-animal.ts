'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { animalIntakeSchema, type AnimalIntakeData } from '@/lib/schemas/animal-intake'
import type { Database } from '@/types/supabase'

export type ActionResult = {
  success: boolean
  error?: string
  animalId?: string
}

type DuplicateCheckResult = {
  exists: boolean
  matches?: {
    id: string
    name: string
    species: string
    breed: string | null
    owner_id: string
    owner_name: string
  }[]
  error?: string
}

export async function checkForDuplicateAnimal(name: string, ownerId: string): Promise<DuplicateCheckResult> {
  try {
    console.log(`🔍 Checking for duplicate animal - Name: ${name}, Owner: ${ownerId}`)
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError)
      return {
        exists: false,
        error: 'Authentication required'
      }
    }

    console.log(`👤 Authenticated user: ${user.id}`)

    // Get user's tenant information
    const { data: membershipData, error: membershipError } = await supabase
      .from('tenant_membership')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membershipData) {
      console.log('❌ Tenant membership error:', membershipError)
      return {
        exists: false,
        error: 'Unable to determine your practice association'
      }
    }

    console.log(`🏢 User tenant: ${membershipData.tenant_id}`)

    // Check for animals with same name and owner within current tenant
    const { data: existingAnimals, error: queryError } = await supabase
      .from('animal')
      .select(`
        id,
        name,
        species,
        breed,
        owner_id,
        owner:owner_id (
          first_name,
          last_name
        )
      `)
      .eq('tenant_id', membershipData.tenant_id)
      .eq('name', name)
      .eq('owner_id', ownerId)

    if (queryError) {
      console.error('❌ Database query error:', queryError)
      return {
        exists: false,
        error: 'Failed to check for existing animals'
      }
    }

    console.log(`📊 Found ${existingAnimals?.length || 0} matching animals in current tenant:`, existingAnimals)

    const matches = existingAnimals?.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      owner_id: animal.owner_id,
      owner_name: `${(animal.owner as any)?.first_name || ''} ${(animal.owner as any)?.last_name || ''}`.trim()
    }))

    return {
      exists: existingAnimals.length > 0,
      matches: existingAnimals.length > 0 ? matches : undefined
    }

  } catch (error) {
    console.error('❌ Unexpected error in checkForDuplicateAnimal:', error)
    return {
      exists: false,
      error: 'An unexpected error occurred'
    }
  }
}

export async function createAnimal(data: AnimalIntakeData): Promise<ActionResult> {
  try {
    console.log('🔍 Starting createAnimal with data:', JSON.stringify(data, null, 2))
    
    // Validate the input data
    console.log('✅ Starting Zod validation')
    const validatedData = animalIntakeSchema.parse(data)
    console.log('✅ Zod validation passed')
    
    console.log(`🚀 Creating animal with name: ${validatedData.name}`)
    
    // Check for duplicates within current tenant only
    const duplicateCheck = await checkForDuplicateAnimal(validatedData.name, validatedData.owner_id)
    
    if (duplicateCheck.error) {
      console.log(`⚠️ Duplicate check failed: ${duplicateCheck.error}`)
      // Continue anyway, but log the issue
    } else if (duplicateCheck.exists) {
      console.log(`🚫 Duplicate animal found:`, duplicateCheck.matches)
      return {
        success: false,
        error: `An animal with this name already exists for this owner: ${duplicateCheck.matches?.[0]?.name}`
      }
    }
    
    // Get the authenticated user and supabase client
    console.log('🔐 Getting authenticated user')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return {
        success: false,
        error: 'You must be logged in to create animals'
      }
    }
    
    console.log('👤 User authenticated:', user.id)

    // Get user's tenant information
    console.log('🏢 Getting user tenant information')
    const { data: membershipData, error: membershipError } = await supabase
      .from('tenant_membership')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membershipData) {
      console.error('❌ Tenant membership error:', membershipError)
      return {
        success: false,
        error: 'Unable to determine your practice association'
      }
    }
    
    console.log('🏢 User tenant:', membershipData.tenant_id)

    // Verify the owner exists and belongs to the same tenant
    console.log('👥 Verifying owner exists and belongs to tenant')
    const { data: ownerData, error: ownerError } = await supabase
      .from('owner')
      .select('id, first_name, last_name, tenant_id')
      .eq('id', validatedData.owner_id)
      .eq('tenant_id', membershipData.tenant_id)
      .single()

    if (ownerError || !ownerData) {
      console.error('❌ Owner verification failed:', ownerError)
      return {
        success: false,
        error: 'Invalid owner selected or owner not found'
      }
    }

    console.log('👥 Owner verified:', ownerData.first_name, ownerData.last_name)

    // Generate a unique animal ID
    const animalId = crypto.randomUUID()
    console.log('🆔 Generated animal ID:', animalId)

    // Prepare the animal data for insertion
    console.log('📋 Preparing animal data for insertion')
    const animalData: Database['public']['Tables']['animal']['Insert'] = {
      id: animalId,
      name: validatedData.name,
      species: validatedData.species,
      breed: validatedData.breed || null,
      color: validatedData.color || null,
      gender: validatedData.gender || null,
      date_of_birth: validatedData.date_of_birth || null,
      weight_kg: validatedData.weight_kg || null,
      microchip_id: validatedData.microchip_id || null,
      insurance_provider: validatedData.insurance_provider || null,
      insurance_policy_number: validatedData.insurance_policy_number || null,
      allergies: validatedData.allergies.length > 0 ? validatedData.allergies : null,
      medical_conditions: validatedData.medical_conditions.length > 0 ? validatedData.medical_conditions : null,
      medications: validatedData.medications.length > 0 ? validatedData.medications : null,
      behavioral_notes: validatedData.behavioral_notes || null,
      dietary_requirements: validatedData.dietary_requirements || null,
      owner_id: validatedData.owner_id,
      tenant_id: membershipData.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Inserting animal into database')
    console.log('📊 Animal data to insert:', JSON.stringify(animalData, null, 2))
    
    // Insert the new animal
    const { data: insertedAnimal, error: insertError } = await supabase
      .from('animal')
      .insert(animalData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database insertion failed:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      console.log('📊 Data that failed to insert:', JSON.stringify(animalData, null, 2))
      
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique constraint violation
        return {
          success: false,
          error: 'An animal with this name already exists for this owner'
        }
      }
      
      if (insertError.code === '23503') { // Foreign key constraint violation
        return {
          success: false,
          error: 'Invalid owner selected'
        }
      }
      
      return {
        success: false,
        error: 'Failed to create animal. Please try again.'
      }
    }

    // Log the successful creation
    console.log(`Animal created successfully: ${insertedAnimal.id} by user ${user.id}`)

    // Revalidate the animals page to show the new animal
    revalidateTag('animals')

    return {
      success: true,
      animalId: insertedAnimal.id
    }

  } catch (error) {
    console.error('Unexpected error in createAnimal:', error)
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

// Helper function to extract medical items from form data
function extractMedicalItems(formData: FormData, fieldName: string) {
  const items = []
  let index = 0
  
  // Keep extracting items until we find no more
  while (formData.has(`${fieldName}.${index}.name`)) {
    const name = (formData.get(`${fieldName}.${index}.name`) as string) || ''
    const notes = (formData.get(`${fieldName}.${index}.notes`) as string) || ''
    const severity = (formData.get(`${fieldName}.${index}.severity`) as string) || ''
    const date_diagnosed = (formData.get(`${fieldName}.${index}.date_diagnosed`) as string) || ''
    
    // Only add item if name is provided
    if (name.trim()) {
      items.push({
        name: name.trim(),
        notes: notes.trim() || undefined,
        severity: (severity && ['Mild', 'Moderate', 'Severe'].includes(severity)) ? severity as 'Mild' | 'Moderate' | 'Severe' : undefined,
        date_diagnosed: date_diagnosed || undefined
      })
    }
    
    index++
  }
  
  return items
}

// Alternative server action that handles form data directly
export async function createAnimalFromForm(formData: FormData): Promise<ActionResult> {
  try {
    console.log('🚀 createAnimalFromForm server action started')
    console.log('📦 Raw FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    // Extract and structure the form data
    const animalData: AnimalIntakeData = {
      name: formData.get('name') as string,
      species: formData.get('species') as any,
      breed: (formData.get('breed') as string) || undefined,
      color: (formData.get('color') as string) || undefined,
      gender: (formData.get('gender') as any) || undefined,
      date_of_birth: (formData.get('date_of_birth') as string) || undefined,
      weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : undefined,
      owner_id: formData.get('owner_id') as string,
      microchip_id: (formData.get('microchip_id') as string) || undefined,
      insurance_provider: (formData.get('insurance_provider') as string) || undefined,
      insurance_policy_number: (formData.get('insurance_policy_number') as string) || undefined,
      behavioral_notes: (formData.get('behavioral_notes') as string) || undefined,
      dietary_requirements: (formData.get('dietary_requirements') as string) || undefined,
      allergies: extractMedicalItems(formData, 'allergies'),
      medical_conditions: extractMedicalItems(formData, 'medical_conditions'),
      medications: extractMedicalItems(formData, 'medications')
    }

    console.log('🔧 Extracted animalData:', JSON.stringify(animalData, null, 2))

    return await createAnimal(animalData)
    
  } catch (error) {
    console.error('Error processing form data:', error)
    return {
      success: false,
      error: 'Invalid form data. Please check your inputs and try again.'
    }
  }
}

// Server action with redirect for successful form submissions
export async function createAnimalAndRedirect(data: AnimalIntakeData) {
  const result = await createAnimal(data)
  
  if (result.success && result.animalId) {
    // Redirect to the animal detail page or animals list
    redirect(`/animals?new=${result.animalId}`)
  }
  
  return result
}

// Helper function to get available owners for the form
export async function getAvailableOwners() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    // Get user's tenant information
    const { data: membershipData } = await supabase
      .from('tenant_membership')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membershipData) return []

    // Get all owners for the tenant
    const { data: owners, error } = await supabase
      .from('owner')
      .select('id, first_name, last_name, email')
      .eq('tenant_id', membershipData.tenant_id)
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching owners:', error)
      return []
    }

    return owners.map(owner => ({
      id: owner.id,
      name: `${owner.first_name} ${owner.last_name}`,
      email: owner.email
    }))

  } catch (error) {
    console.error('Error fetching available owners:', error)
    return []
  }
}