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

export async function getActiveCustomers(): Promise<CustomerWithPets[]> {
  const supabase = await createClient()
  
  // Get owners with their patients and latest appointment info
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
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching active customers:', error)
    return []
  }

  if (!data) return []

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

  return customers
}

export async function getCustomerStats() {
  const supabase = await createClient()
  
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