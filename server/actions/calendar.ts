'use server'

import { getAppointmentsForCalendar, getStaffMembers } from '@/server/queries/appointments'
import type { AppointmentWithDetails, StaffMember, AppointmentFilters } from '@/server/queries/appointments'

export async function fetchCalendarAppointments(filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> {
  try {
    console.log('=== fetchCalendarAppointments Debug ===')
    console.log('Filters:', filters)
    
    const appointments = await getAppointmentsForCalendar(filters)
    
    console.log('Fetched appointments count:', appointments.length)
    console.log('First few appointments:', appointments.slice(0, 3))
    console.log('======================================')
    
    return appointments
  } catch (error) {
    console.error('Error fetching calendar appointments:', error)
    return []
  }
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    return await getStaffMembers()
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return []
  }
}