'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { customerIntakeSchema, type CustomerIntakeData } from '@/lib/schemas/customer-intake'
import type { Database } from '@/types/supabase'

export type ActionResult = {
  success: boolean
  error?: string
  customerId?: string
}

type DuplicateCheckResult = {
  exists: boolean
  matches?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }[]
  error?: string
}

export async function checkForDuplicateCustomer(email: string, phone?: string): Promise<DuplicateCheckResult> {
  try {
    console.log(`🔍 Checking for duplicate customer - Email: ${email}, Phone: ${phone || 'N/A'}`)
    
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
      .from('TenantMembership')
      .select('tenantId')
      .eq('userId', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membershipData) {
      console.log('❌ Tenant membership error:', membershipError)
      console.log('Membership data:', membershipData)
      return {
        exists: false,
        error: 'Unable to determine your practice association'
      }
    }

    console.log(`🏢 User tenant: ${membershipData.tenantId}`)

    // Build query to check for duplicates within current tenant only
    let query = supabase
      .from('Owner')
      .select('id, firstName, lastName, email, phone, tenantId')
      .eq('tenantId', membershipData.tenantId)

    // Check for email match or phone match using proper Supabase syntax
    if (phone && phone.trim()) {
      // Use proper OR syntax with parentheses
      query = query.or(`email.eq."${email}",phone.eq."${phone}"`)
      console.log(`🔍 Searching for email: "${email}" OR phone: "${phone}" in tenant: ${membershipData.tenantId}`)
    } else {
      query = query.eq('email', email)
      console.log(`🔍 Searching for email: "${email}" in tenant: ${membershipData.tenantId}`)
    }

    const { data: existingCustomers, error: queryError } = await query

    if (queryError) {
      console.error('❌ Database query error:', queryError)
      return {
        exists: false,
        error: 'Failed to check for existing customers'
      }
    }

    console.log(`📊 Found ${existingCustomers?.length || 0} matching customers in current tenant:`, existingCustomers)

    return {
      exists: existingCustomers.length > 0,
      matches: existingCustomers.length > 0 ? existingCustomers : undefined
    }

  } catch (error) {
    console.error('❌ Unexpected error in checkForDuplicateCustomer:', error)
    return {
      exists: false,
      error: 'An unexpected error occurred'
    }
  }
}

export async function createCustomer(data: CustomerIntakeData): Promise<ActionResult> {
  try {
    // Validate the input data
    const validatedData = customerIntakeSchema.parse(data)
    
    console.log(`🚀 Creating customer with email: ${validatedData.email}`)
    
    // Check for duplicates within current tenant only
    const duplicateCheck = await checkForDuplicateCustomer(validatedData.email, validatedData.phone)
    
    if (duplicateCheck.error) {
      console.log(`⚠️ Duplicate check failed: ${duplicateCheck.error}`)
      // Continue anyway, but log the issue
    } else if (duplicateCheck.exists) {
      console.log(`🚫 Duplicate customer found:`, duplicateCheck.matches)
      return {
        success: false,
        error: `A customer with this email address already exists: ${duplicateCheck.matches?.[0]?.firstName} ${duplicateCheck.matches?.[0]?.lastName}`
      }
    }
    
    // Get the authenticated user and supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create customers'
      }
    }

    // Get user's tenant information
    const { data: membershipData, error: membershipError } = await supabase
      .from('TenantMembership')
      .select('tenantId')
      .eq('userId', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membershipData) {
      return {
        success: false,
        error: 'Unable to determine your practice association'
      }
    }

    // Generate a unique customer ID
    const customerId = crypto.randomUUID()

    // Prepare the owner data for insertion
    const ownerData: Database['public']['Tables']['Owner']['Insert'] = {
      id: customerId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      title: validatedData.title || null,
      address: validatedData.address,
      preferredPractice: validatedData.preferredPractice || null,
      gdprConsent: validatedData.gdprConsent,
      additionalNotes: validatedData.additionalNotes || null,
      // emergencyContacts: validatedData.emergencyContact ? [validatedData.emergencyContact] : null,
      tenantId: membershipData.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Insert the new customer
    const { data: insertedCustomer, error: insertError } = await supabase
      .from('Owner')
      .insert(ownerData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating customer:', insertError)
      
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique constraint violation
        return {
          success: false,
          error: 'A customer with this email address already exists'
        }
      }
      
      return {
        success: false,
        error: 'Failed to create customer. Please try again.'
      }
    }

    // Log the successful creation (optional - for audit purposes)
    console.log(`Customer created successfully: ${insertedCustomer.id} by user ${user.id}`)

    // Revalidate the customers page to show the new customer
    revalidatePath('/customers')
    revalidatePath('/customers/active')

    return {
      success: true,
      customerId: insertedCustomer.id
    }

  } catch (error) {
    console.error('Unexpected error in createCustomer:', error)
    
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

// Helper function to extract emergency contacts from form data
function extractEmergencyContacts(formData: FormData) {
  const contacts = []
  let index = 0
  
  // Keep extracting contacts until we find no more
  while (formData.has(`emergencyContacts.${index}.name`) || 
         formData.has(`emergencyContacts.${index}.phone`) || 
         formData.has(`emergencyContacts.${index}.relationship`)) {
    
    const name = (formData.get(`emergencyContacts.${index}.name`) as string) || undefined
    const phone = (formData.get(`emergencyContacts.${index}.phone`) as string) || undefined
    const relationship = (formData.get(`emergencyContacts.${index}.relationship`) as string) || undefined
    
    // Only add contact if at least one field is filled
    if (name || phone || relationship) {
      contacts.push({ name, phone, relationship })
    }
    
    index++
  }
  
  return contacts.length > 0 ? contacts : undefined
}

// Alternative server action that handles form data directly
export async function createCustomerFromForm(formData: FormData): Promise<ActionResult> {
  try {
    // Extract and structure the form data
    const customerData: CustomerIntakeData = {
      title: formData.get('title') as "Mr." | "Mrs." | "Ms." | "Dr." | "Prof." | "Rev." | undefined || undefined,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: {
        street: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('region') as string,
        zipCode: formData.get('postal_code') as string,
        country: (formData.get('country') as string) || 'US'
      },
      preferredPractice: (formData.get('preferredPractice') as string) || undefined,
      gdprConsent: formData.get('gdprConsent') === 'on',
      marketingConsent: formData.get('marketingConsent') === 'on',
      additionalNotes: (formData.get('additionalNotes') as string) || undefined,
      emergencyContact: extractEmergencyContacts(formData)?.[0] || undefined
    }

    return await createCustomer(customerData)
    
  } catch (error) {
    console.error('Error processing form data:', error)
    return {
      success: false,
      error: 'Invalid form data. Please check your inputs and try again.'
    }
  }
}

// Server action with redirect for successful form submissions
export async function createCustomerAndRedirect(data: CustomerIntakeData) {
  const result = await createCustomer(data)
  
  if (result.success && result.customerId) {
    // Redirect to the customer detail page or customers list
    redirect(`/customers?new=${result.customerId}`)
  }
  
  return result
}

// Helper function to get available practices/locations for the form
export async function getAvailablePractices() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    // Get user's tenant information
    const { data: membershipData } = await supabase
      .from('TenantMembership')
      .select(`
        Tenant (
          id,
          name,
          subdomain
        )
      `)
      .eq('userId', user.id)
      .eq('status', 'active')

    if (!membershipData) return []

    return membershipData.map(membership => ({
      id: membership.Tenant.id,
      name: membership.Tenant.name,
      subdomain: membership.Tenant.subdomain
    }))

  } catch (error) {
    console.error('Error fetching available practices:', error)
    return []
  }
}