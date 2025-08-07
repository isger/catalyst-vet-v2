'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Note: Animal and Customer table types not yet available in supabase types
// type Animal = Database['public']['Tables']['animal']['Row']
// type Customer = Database['public']['Tables']['customer']['Row']

export type AnimalSearchResult = any & {
  owner: any
}

export async function searchAnimals(query: string): Promise<AnimalSearchResult[]> {
  if (!query || query.trim().length < 1) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // Get user's tenant information
  const { data: membershipData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membershipData) {
    return []
  }

  const searchTerm = query.trim()
  
  // Search in animal table - check if it's 'animal' or 'patient'
  let { data: animals, error } = await supabase
    .from('animal')
    .select(`
      *,
      owner:owner_id (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('tenant_id', membershipData.tenant_id)
    .or(`name.ilike.%${searchTerm}%,species.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%`)
    .order('name', { ascending: true })
    .limit(20)

  // If 'animal' table doesn't exist, try 'patient' table
  if (error && error.message?.includes('relation "public.animal" does not exist')) {
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select(`
        *,
        owner:owner_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('tenant_id', membershipData.tenant_id)
      .or(`name.ilike.%${searchTerm}%,species.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%`)
      .order('name', { ascending: true })
      .limit(20)
    
    if (patientError) {
      console.error('❌ Error searching animals/patients:', patientError)
      return []
    }
    
    animals = patientData
  } else if (error) {
    console.error('❌ Error searching animals:', error)
    return []
  }

  return (animals as AnimalSearchResult[]) || []
}

export async function getRecentAnimalSearches(): Promise<AnimalSearchResult[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // Get user's tenant information
  const { data: membershipData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membershipData) {
    return []
  }

  // Get recent animals (last 5)
  let { data: animals, error } = await supabase
    .from('animal')
    .select(`
      *,
      owner:owner_id (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('tenant_id', membershipData.tenant_id)
    .order('created_at', { ascending: false })
    .limit(5)

  // If 'animal' table doesn't exist, try 'patient' table
  if (error && error.message?.includes('relation "public.animal" does not exist')) {
    const { data: patientData, error: patientError } = await supabase
      .from('patient')
      .select(`
        *,
        owner:owner_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('tenant_id', membershipData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (patientError) {
      console.error('❌ Error getting recent animals/patients:', patientError)
      return []
    }
    
    animals = patientData
  } else if (error) {
    console.error('❌ Error getting recent animals:', error)
    return []
  }

  return (animals as AnimalSearchResult[]) || []
}