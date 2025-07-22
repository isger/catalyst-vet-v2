'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { Database } from '@/types/supabase'

type Animal = Database['public']['Tables']['animal']['Row']
type Owner = Database['public']['Tables']['customer']['Row']

export type AnimalWithOwner = Animal & {
  owner: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    address?: any
  }
}

export type AnimalStats = {
  totalAnimals: number
  totalSpecies: number
  recentAnimals: number
  averageAge: number
}

export type PaginatedAnimalsResult = {
  animals: AnimalWithOwner[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Cache the animal stats query for 5 minutes
export const getAnimalStats = cache(async (): Promise<AnimalStats> => {
  console.log('🔍 Getting animal stats')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
    return { totalAnimals: 0, totalSpecies: 0, recentAnimals: 0, averageAge: 0 }
  }

  // Get user's tenant information
  const { data: membershipData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membershipData) {
    console.log('❌ No tenant membership found')
    return { totalAnimals: 0, totalSpecies: 0, recentAnimals: 0, averageAge: 0 }
  }

  const tenantId = membershipData.tenant_id
  console.log('🏢 Tenant ID:', tenantId)

  // Get all animals for the tenant
  const { data: animals, error } = await supabase
    .from('animal')
    .select('id, species, date_of_birth, created_at')
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('❌ Error fetching animals:', error)
    return { totalAnimals: 0, totalSpecies: 0, recentAnimals: 0, averageAge: 0 }
  }

  const totalAnimals = animals.length
  
  // Calculate unique species
  const uniqueSpecies = new Set(animals.map(a => a.species))
  const totalSpecies = uniqueSpecies.size
  
  // Calculate recent animals (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentAnimals = animals.filter(a => 
    new Date(a.created_at) >= thirtyDaysAgo
  ).length
  
  // Calculate average age (only for animals with date of birth)
  const animalsWithDOB = animals.filter(a => a.date_of_birth)
  let averageAge = 0
  
  if (animalsWithDOB.length > 0) {
    const totalAgeInDays = animalsWithDOB.reduce((sum, animal) => {
      const birth = new Date(animal.date_of_birth!)
      const now = new Date()
      const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
      return sum + ageInDays
    }, 0)
    
    averageAge = Math.round(totalAgeInDays / animalsWithDOB.length / 365 * 10) / 10 // Average age in years
  }

  console.log('📊 Animal stats:', { totalAnimals, totalSpecies, recentAnimals, averageAge })
  
  return { totalAnimals, totalSpecies, recentAnimals, averageAge }
})

// Get paginated animals with search and sorting
export async function fetchPaginatedAnimals({
  page = 1,
  pageSize = 10,
  search = '',
  sortBy = 'created_at',
  sortOrder = 'desc'
}: {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
} = {}): Promise<PaginatedAnimalsResult> {
  console.log('🔍 Fetching paginated animals:', { page, pageSize, search, sortBy, sortOrder })
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
    return {
      animals: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize
    }
  }

  // Get user's tenant information
  const { data: membershipData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membershipData) {
    console.log('❌ No tenant membership found')
    return {
      animals: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize
    }
  }

  const tenantId = membershipData.tenant_id
  console.log('🏢 Tenant ID:', tenantId)

  // Build the base query
  let query = supabase
    .from('animal')
    .select(`
      *,
      owner:owner_id (
        id,
        first_name,
        last_name,
        email
      )
    `, { count: 'exact' })
    .eq('tenant_id', tenantId)

  // Add search filter if provided
  if (search) {
    query = query.or(`name.ilike.%${search}%,species.ilike.%${search}%,breed.ilike.%${search}%`)
  }

  // Add sorting
  const ascending = sortOrder === 'asc'
  switch (sortBy) {
    case 'name':
      query = query.order('name', { ascending })
      break
    case 'species':
      query = query.order('species', { ascending })
      break
    case 'breed':
      query = query.order('breed', { ascending, nullsFirst: false })
      break
    case 'age':
      query = query.order('date_of_birth', { ascending: !ascending, nullsFirst: false })
      break
    case 'owner':
      // Note: This is a simplified approach. For proper owner sorting, you'd need a more complex query
      query = query.order('owner_id', { ascending })
      break
    case 'created_at':
    default:
      query = query.order('created_at', { ascending })
      break
  }

  // Add pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: animals, error, count } = await query

  if (error) {
    console.error('❌ Error fetching animals:', error)
    return {
      animals: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize
    }
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  console.log('📊 Fetched animals:', { 
    count: animals?.length || 0, 
    totalCount, 
    totalPages, 
    currentPage: page 
  })

  return {
    animals: animals as AnimalWithOwner[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  }
}

// Get a single animal by ID
export async function getAnimalById(id: string): Promise<AnimalWithOwner | null> {
  console.log('🔍 Getting animal by ID:', id)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
    return null
  }

  // Get user's tenant information
  const { data: membershipData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membershipData) {
    console.log('❌ No tenant membership found')
    return null
  }

  const { data: animal, error } = await supabase
    .from('animal')
    .select(`
      *,
      owner:owner_id (
        id,
        first_name,
        last_name,
        email,
        phone,
        address
      )
    `)
    .eq('id', id)
    .eq('tenant_id', membershipData.tenant_id)
    .single()

  if (error) {
    console.error('❌ Error fetching animal:', error)
    return null
  }

  console.log('✅ Animal found:', animal.name)
  return animal as AnimalWithOwner
}

// Get animals by owner ID
export async function getAnimalsByOwner(ownerId: string): Promise<Animal[]> {
  console.log('🔍 Getting animals by owner ID:', ownerId)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
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
    console.log('❌ No tenant membership found')
    return []
  }

  const { data: animals, error } = await supabase
    .from('animal')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('tenant_id', membershipData.tenant_id)
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Error fetching animals:', error)
    return []
  }

  console.log('✅ Animals found for owner:', animals.length)
  return animals
}

// Get species distribution for dashboard charts
export async function getSpeciesDistribution(): Promise<{ species: string; count: number }[]> {
  console.log('🔍 Getting species distribution')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
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
    console.log('❌ No tenant membership found')
    return []
  }

  const { data: animals, error } = await supabase
    .from('animal')
    .select('species')
    .eq('tenant_id', membershipData.tenant_id)

  if (error) {
    console.error('❌ Error fetching species distribution:', error)
    return []
  }

  // Count species occurrences
  const speciesCount = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const distribution = Object.entries(speciesCount)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)

  console.log('📊 Species distribution:', distribution)
  return distribution
}

// Get recent animals (last 30 days)
export async function getRecentAnimals(limit: number = 10): Promise<AnimalWithOwner[]> {
  console.log('🔍 Getting recent animals, limit:', limit)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('❌ No authenticated user')
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
    console.log('❌ No tenant membership found')
    return []
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: animals, error } = await supabase
    .from('animal')
    .select(`
      *,
      owner:owner_id (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('tenant_id', membershipData.tenant_id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ Error fetching recent animals:', error)
    return []
  }

  console.log('✅ Recent animals found:', animals.length)
  return animals as AnimalWithOwner[]
}