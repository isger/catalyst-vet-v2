import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for tables
type Owner = Database['public']['Tables']['Owner']['Row']
type Patient = Database['public']['Tables']['Patient']['Row']
type Appointment = Database['public']['Tables']['Appointment']['Row']

export interface CustomerWithPets {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: any
  createdAt: string
  updatedAt: string
  tenantId: string
  patients: {
    id: string
    name: string
    species: string
    breed: string | null
    dateOfBirth: string | null
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
    .from('TenantMembership')
    .select('tenantId')
    .eq('userId', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return { data: [], total: 0, page, pageSize, totalPages: 0 }
  
  // Build base query
  let query = supabase
    .from('Owner')
    .select(`
      *,
      Patient (
        id,
        name,
        species,
        breed,
        dateOfBirth,
        Appointment (
          scheduledAt,
          status
        )
      )
    `, { count: 'exact' })
    .eq('tenantId', tenantData.tenantId)

  // Add search filter
  if (search) {
    query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Add sorting
  const ascending = sortOrder === 'asc'
  if (sortBy === 'name') {
    query = query.order('firstName', { ascending }).order('lastName', { ascending })
  } else {
    query = query.order(sortBy, { ascending })
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
    // Get the most recent appointment across all pets
    const allAppointments = owner.Patient?.flatMap(patient => 
      patient.Appointment?.filter(apt => apt.status === 'completed') || []
    ) || []
    
    const lastVisit = allAppointments.length > 0 
      ? allAppointments
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]
          ?.scheduledAt
      : undefined

    return {
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
      tenantId: owner.tenantId,
      patients: owner.Patient?.map(patient => ({
        id: patient.id,
        name: patient.name,
        species: patient.species,
        breed: patient.breed,
        dateOfBirth: patient.dateOfBirth
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
    .from('TenantMembership')
    .select('tenantId')
    .eq('userId', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return null
  
  // Get specific customer with their patients and latest appointment info, filtered by tenant
  const { data, error } = await supabase
    .from('Owner')
    .select(`
      *,
      Patient (
        id,
        name,
        species,
        breed,
        dateOfBirth,
        Appointment (
          scheduledAt,
          status
        )
      )
    `)
    .eq('id', customerId)
    .eq('tenantId', tenantData.tenantId)
    .single()

  if (error) {
    console.error('Error fetching customer by ID:', error)
    return null
  }

  if (!data) return null

  // Get the most recent appointment across all pets
  const allAppointments = data.Patient?.flatMap(patient => 
    patient.Appointment?.filter(apt => apt.status === 'completed') || []
  ) || []
  
  const lastVisit = allAppointments.length > 0 
    ? allAppointments
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]
        ?.scheduledAt
    : undefined

  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    tenantId: data.tenantId,
    patients: data.Patient?.map(patient => ({
      id: patient.id,
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      dateOfBirth: patient.dateOfBirth
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
    .from('TenantMembership')
    .select('tenantId')
    .eq('userId', user.id)
    .eq('status', 'active')
    .single()
  
  if (!tenantData) return { active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 }
  
  const { data: owners, error } = await supabase
    .from('Owner')
    .select(`
      id,
      createdAt,
      Patient (
        id,
        Appointment (
          status,
          scheduledAt
        )
      )
    `)
    .eq('tenantId', tenantData.tenantId)

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
    const createdDate = new Date(owner.createdAt)
    
    // Get all appointments from all patients
    const allAppointments = owner.Patient?.flatMap(patient => 
      patient.Appointment || []
    ) || []
    
    const hasRecentAppointment = allAppointments.some(apt => 
      new Date(apt.scheduledAt) > thirtyDaysAgo
    )
    const hasUpcomingAppointment = allAppointments.some(apt => 
      apt.status === 'scheduled' && new Date(apt.scheduledAt) > now
    )

    // New clients (created in last 30 days)
    if (createdDate > thirtyDaysAgo) {
      newClients++
    }
    
    // Consultation (has upcoming appointments)
    if (hasUpcomingAppointment) {
      consultation++
    }
    
    // Active (has recent activity)
    if (hasRecentAppointment || hasUpcomingAppointment) {
      active++
    }
    
    // Inactive (no activity in 6+ months)
    if (!hasRecentAppointment && createdDate < sixMonthsAgo) {
      inactive++
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