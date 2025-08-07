import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for tables
type Owner = any
type Animal = any

export interface CustomerWithPets {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: any
  created_at: string
  updated_at: string
  tenant_id: string
  additional_notes?: string | null
  animals: {
    id: string
    name: string
    species: string
    breed: string | null
    date_of_birth: string | null
  }[]
  lastVisit?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getActiveCustomers(params: PaginationParams = {}): Promise<PaginatedResult<CustomerWithPets>> {
  const { page = 1, pageSize = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = params
  const supabase = await createClient()
  
  // Get current user to filter by tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], total: 0, page, pageSize, totalPages: 0 }
  
  // Get user's tenant
  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return { data: [], total: 0, page, pageSize, totalPages: 0 }
  
  // Build base query - only select necessary fields and use estimated count for better performance
  let query = supabase
    .from('owner')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      created_at,
      updated_at,
      tenant_id,
      additional_notes,
      animal (
        id,
        name,
        species,
        breed,
        date_of_birth
      )
    `, { count: 'estimated' }) // Use estimated count for better performance
    .eq('tenant_id', tenantData.tenant_id)

  // Add search filter
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Add sorting
  const ascending = sortOrder === 'asc'
  if (sortBy === 'name') {
    query = query.order('first_name', { ascending }).order('last_name', { ascending })
  } else {
    // Map camelCase to snake_case for sorting
    const sortField = sortBy === 'createdAt' ? 'created_at' : 
                      sortBy === 'updatedAt' ? 'updated_at' : 
                      sortBy === 'firstName' ? 'first_name' :
                      sortBy === 'lastName' ? 'last_name' : sortBy
    query = query.order(sortField, { ascending })
  }

  // Add pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching active customers:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  if (!data) return { data: [], total: 0, page, pageSize, totalPages: 0 }

  // Transform the data to match our interface
  const customers: CustomerWithPets[] = data.map(owner => {
    // TODO: Implement appointment tracking when appointment table is ready
    const lastVisit = undefined

    return {
      id: owner.id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      created_at: owner.created_at,
      updated_at: owner.updated_at,
      tenant_id: owner.tenant_id,
      additional_notes: owner.additional_notes,
      animals: owner.animal?.map(animal => ({
        id: animal.id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        date_of_birth: animal.date_of_birth
      })) || [],
      lastVisit
    }
  })

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: customers,
    total,
    page,
    pageSize,
    totalPages
  }
}

export async function getCustomerByIdForTenant(customerId: string): Promise<CustomerWithPets | null> {
  const supabase = await createClient()
  
  // Get current user to filter by tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Get user's tenant
  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return null
  
  // Get specific customer with their animals and latest appointment info, filtered by tenant
  const { data, error } = await supabase
    .from('owner')
    .select(`
      *,
      animal (
        id,
        name,
        species,
        breed,
        date_of_birth
      )
    `)
    .eq('id', customerId)
    .eq('tenant_id', tenantData.tenant_id)
    .single()

  if (error) {
    console.error('Error fetching customer by ID:', error)
    return null
  }

  if (!data) return null

  // TODO: Implement appointment tracking when appointment table is ready
  const lastVisit = undefined

  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    created_at: data.created_at,
    updated_at: data.updated_at,
    tenant_id: data.tenant_id,
    additional_notes: data.additional_notes,
    animals: data.animal?.map((animal: any) => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      date_of_birth: animal.date_of_birth
    })) || [],
    lastVisit
  }
}

export async function getCustomerStats() {
  const supabase = await createClient()
  
  // Get current user to filter by tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 }
  
  // Get user's tenant
  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return { active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 }
  
  const { data: owners, error } = await supabase
    .from('owner')
    .select(`
      id,
      created_at,
      animal (
        id
      )
    `)
    .eq('tenant_id', tenantData.tenant_id)

  if (error) {
    console.error('Error fetching customer stats:', error)
    return { active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 }
  }

  if (!owners) {
    return { active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 }
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

  let active = 0
  let newClients = 0
  let consultation = 0
  let inactive = 0

  owners.forEach(owner => {
    const createdDate = new Date(owner.created_at)
    
    // TODO: Implement appointment-based statistics when appointment table is ready
    // For now, just count based on creation date
    
    // New clients (created in last 30 days)
    if (createdDate > thirtyDaysAgo) {
      newClients++
      active++ // New clients are considered active
    } else if (createdDate < sixMonthsAgo) {
      // Inactive (no activity in 6+ months, for now based on creation date)
      inactive++
    } else {
      // Active (created within 6 months)
      active++
    }
  })

  return { 
    active, 
    new: newClients, 
    consultation, 
    followUp: 0, // We'll implement this later based on appointment follow-up logic
    inactive 
  }
}