import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Type helpers for calendar schema tables
type Appointment = Database['calendar']['Tables']['appointment']['Row']
// type AppointmentDetails = Database['calendar']['Views']['appointment_details']['Row']
// type StaffProfile = Database['calendar']['Tables']['staff_profile']['Row']
type AppointmentType = Database['calendar']['Tables']['appointment_type']['Row']

export interface AppointmentWithDetails {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  appointment_type: string
  status: string
  location: string | null
  color: string | null
  notes: string | null
  recurrence_rule: string | null
  duration_minutes: number | null
  staff: {
    id: string
    first_name: string
    last_name: string
    color: string | null
  }
  owner: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  } | null
  animal: {
    id: string
    name: string
    species: string
    breed: string | null
  } | null
}

export interface AppointmentFilters {
  staffIds?: string[]
  startDate?: string
  endDate?: string
  status?: string[]
  appointmentType?: string[]
}

export interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  color: string | null
}

// Helper function to get user's tenant ID
async function getUserTenant(): Promise<string | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return tenantData?.tenant_id || null
}

// Get appointments for calendar views using the appointment_details view
export async function getAppointmentsForCalendar(filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()
  
  let query = supabase
    .schema('calendar')
    .from('appointment_details')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('start_time', { ascending: true })

  // Apply date filters
  if (filters.startDate) {
    query = query.gte('start_time', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('start_time', filters.endDate)
  }

  // Apply status filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  // Apply appointment type filters
  if (filters.appointmentType && filters.appointmentType.length > 0) {
    query = query.in('appointment_type_name', filters.appointmentType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching appointments for calendar:', error)
    return []
  }

  if (!data) return []

  // Transform appointment_details view data to AppointmentWithDetails
  return data.map(appointment => ({
    id: appointment.appointment_id || '',
    title: `${appointment.animal_name} - ${appointment.appointment_type_name}`,
    description: appointment.reason,
    start_time: appointment.start_time || '',
    end_time: appointment.end_time || '',
    all_day: false,
    appointment_type: appointment.appointment_type_name || '',
    status: appointment.status || '',
    location: null,
    color: appointment.appointment_type_color,
    notes: appointment.notes,
    recurrence_rule: null,
    duration_minutes: appointment.appointment_type_duration,
    staff: {
      id: '', // Need to get from staff assignments
      first_name: '',
      last_name: '',
      color: appointment.appointment_type_color,
    },
    owner: appointment.owner_id ? {
      id: appointment.owner_id,
      first_name: appointment.owner_first_name || '',
      last_name: appointment.owner_last_name || '',
      email: appointment.owner_email || '',
      phone: appointment.owner_phone || '',
    } : null,
    animal: appointment.animal_id ? {
      id: appointment.animal_id,
      name: appointment.animal_name || '',
      species: appointment.animal_species || '',
      breed: appointment.animal_breed,
    } : null,
  })).filter(apt => filters.staffIds ? false : true) // Filter by staff after getting staff assignments
}

// Get appointments in a specific date range using the database function
export async function getAppointmentsInRange(
  startDate: string,
  endDate: string,
  staffId?: string
): Promise<any[]> {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_appointments_in_range', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_staff_id: staffId || undefined,
    p_tenant_id: tenantId,
  })

  if (error) {
    console.error('Error fetching appointments in range:', error)
    return []
  }

  return data || []
}

// Get a single appointment by ID with full details
export async function getAppointmentById(appointmentId: string): Promise<AppointmentWithDetails | null> {
  const tenantId = await getUserTenant()
  if (!tenantId) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('calendar')
    .from('appointment_details')
    .select('*')
    .eq('appointment_id', appointmentId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    console.error('Error fetching appointment by ID:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.appointment_id || '',
    title: `${data.animal_name} - ${data.appointment_type_name}`,
    description: data.reason,
    start_time: data.start_time || '',
    end_time: data.end_time || '',
    all_day: false,
    appointment_type: data.appointment_type_name || '',
    status: data.status || '',
    location: null,
    color: data.appointment_type_color,
    notes: data.notes,
    recurrence_rule: null,
    duration_minutes: data.appointment_type_duration,
    staff: {
      id: '', // Need to get from staff assignments
      first_name: '',
      last_name: '',
      color: data.appointment_type_color,
    },
    owner: data.owner_id ? {
      id: data.owner_id,
      first_name: data.owner_first_name || '',
      last_name: data.owner_last_name || '',
      email: data.owner_email || '',
      phone: data.owner_phone || '',
    } : null,
    animal: data.animal_id ? {
      id: data.animal_id,
      name: data.animal_name || '',
      species: data.animal_species || '',
      breed: data.animal_breed,
    } : null,
  }
}

// Get all staff members for the tenant
export async function getStaffMembers(): Promise<StaffMember[]> {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('calendar')
    .from('staff_profile')
    .select(`
      id,
      user_id,
      staff_type,
      color
    `)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Error fetching staff profiles:', error)
    return []
  }

  if (!data) return []

  // Get user details from public schema
  const userIds = data.map(staff => staff.user_id)
  const { data: users, error: userError } = await supabase
    .from('user')
    .select('id, name, email')
    .in('id', userIds)

  if (userError) {
    console.error('Error fetching user details:', userError)
    return []
  }

  const userMap = new Map(users?.map(user => [user.id, user]) || [])

  return data.map(staff => {
    const user = userMap.get(staff.user_id)
    return {
      id: staff.id,
      first_name: user?.name?.split(' ')[0] || '',
      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      role: staff.staff_type,
      color: staff.color,
    }
  })
}

// Get appointments for a specific staff member on a specific date
export async function getStaffAppointmentsForDate(
  staffId: string,
  date: string
): Promise<AppointmentWithDetails[]> {
  const startOfDay = `${date}T00:00:00Z`
  const endOfDay = `${date}T23:59:59Z`

  return getAppointmentsForCalendar({
    staffIds: [staffId],
    startDate: startOfDay,
    endDate: endOfDay,
  })
}

// Get appointment statistics for dashboard
export async function getAppointmentStats() {
  const tenantId = await getUserTenant()
  if (!tenantId) return {
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  }

  const supabase = await createClient()
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Use calendar schema for appointments
  // Get total appointments
  const { count: totalCount } = await supabase
    .schema('calendar')
    .from('appointment')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Get today's appointments
  const { count: todayCount } = await supabase
    .schema('calendar')
    .from('appointment')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('start_time', `${today}T00:00:00Z`)
    .lt('start_time', `${tomorrow}T00:00:00Z`)

  // Get upcoming appointments (next 7 days excluding today)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { count: upcomingCount } = await supabase
    .schema('calendar')
    .from('appointment')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('start_time', `${tomorrow}T00:00:00Z`)
    .lt('start_time', `${nextWeek}T23:59:59Z`)

  // Get completed appointments
  const { count: completedCount } = await supabase
    .schema('calendar')
    .from('appointment')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')

  // Get cancelled appointments
  const { count: cancelledCount } = await supabase
    .schema('calendar')
    .from('appointment')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'cancelled')

  return {
    total: totalCount || 0,
    today: todayCount || 0,
    upcoming: upcomingCount || 0,
    completed: completedCount || 0,
    cancelled: cancelledCount || 0,
  }
}

// Get customers with their animals for appointment creation
export async function getCustomersWithAnimals() {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('owner')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      animal (
        id,
        name,
        species,
        breed
      )
    `)
    .eq('tenant_id', tenantId)
    .order('first_name', { ascending: true })

  if (error) {
    console.error('Error fetching customers with animals:', error)
    return []
  }

  return data || []
}

// Check for appointment conflicts using the calendar schema function
export async function checkAppointmentConflicts(
  staffProfileId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<any[]> {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()

  // TODO: Re-enable when function is available in database
  // const { data, error } = await supabase.rpc('check_appointment_conflicts', {
  //   p_tenant_id: tenantId,
  //   p_staff_profile_id: staffProfileId,
  //   p_start_time: startTime,
  //   p_end_time: endTime,
  //   p_appointment_id: excludeAppointmentId || undefined,
  // })

  // if (error) {
  //   console.error('Error checking appointment conflicts:', error)
  //   return []
  // }
  
  // Temporary fallback - return empty array until function is implemented
  const data: any[] = []

  return data || []
}

// Get all appointment types for the tenant
export async function getAppointmentTypes() {
  const tenantId = await getUserTenant()
  if (!tenantId) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('calendar')
    .from('appointment_type')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching appointment types:', error)
    return []
  }

  return data || []
}