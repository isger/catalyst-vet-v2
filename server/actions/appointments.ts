'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type Appointment = Database['calendar']['Tables']['appointment']['Row']
type AppointmentInsert = Database['calendar']['Tables']['appointment']['Insert']
type AppointmentUpdate = Database['calendar']['Tables']['appointment']['Update']
type AppointmentStaff = Database['calendar']['Tables']['appointment_staff']['Insert']

// Validation schemas
const createAppointmentSchema = z.object({
  animal_id: z.string().uuid('Invalid animal ID'),
  appointment_type_id: z.string().uuid('Invalid appointment type ID'),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
  status: z.string().default('scheduled'),
  notes: z.string().optional(),
  reason: z.string().optional(),
  staff_profile_ids: z.array(z.string().uuid()).min(1, 'At least one staff member is required'),
})

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  id: z.string().uuid('Invalid appointment ID'),
})

const rescheduleAppointmentSchema = z.object({
  id: z.string().uuid('Invalid appointment ID'),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
})

export type CreateAppointmentData = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>
export type RescheduleAppointmentData = z.infer<typeof rescheduleAppointmentSchema>

// Helper function to get user's tenant
async function getUserTenant() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: tenantData } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!tenantData) {
    throw new Error('Unauthorized')
  }

  return tenantData.tenant_id
}

// Check if staff is available for the given time slot
async function checkStaffAvailability(
  staffProfileId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const supabase = await createClient()
  const tenantId = await getUserTenant()
  
  const { data, error } = await supabase.rpc('is_staff_available', {
    p_staff_id: staffProfileId,
    p_start_time: startTime,
    p_end_time: endTime,
    p_tenant_id: tenantId,
    p_exclude_appointment_id: excludeAppointmentId,
  })

  if (error) {
    console.error('Error checking staff availability:', error)
    return false
  }

  return data
}

// Create a new appointment
export async function createAppointment(data: CreateAppointmentData) {
  try {
    const tenantId = await getUserTenant()
    const supabase = await createClient()

    // Validate input data
    const validationResult = createAppointmentSchema.safeParse(data)
    if (!validationResult.success) {
      return { error: 'Invalid data', details: validationResult.error.format() }
    }

    const validData = validationResult.data

    // Validate start time is before end time
    if (new Date(validData.start_time) >= new Date(validData.end_time)) {
      return { error: 'Start time must be before end time' }
    }

    // Check staff availability for all assigned staff
    for (const staffProfileId of validData.staff_profile_ids) {
      const isAvailable = await checkStaffAvailability(
        staffProfileId,
        validData.start_time,
        validData.end_time
      )

      if (!isAvailable) {
        return { error: 'One or more staff members are not available at the selected time' }
      }

      // Verify staff profile belongs to tenant
      const { data: staffProfile } = await supabase
        .schema('calendar')
        .from('staff_profile')
        .select('id')
        .eq('id', staffProfileId)
        .eq('tenant_id', tenantId)
        .single()

      if (!staffProfile) {
        return { error: 'Staff member not found' }
      }
    }

    // Verify animal belongs to tenant
    const { data: animal } = await supabase
      .from('animal')
      .select('id, owner_id')
      .eq('id', validData.animal_id)
      .eq('tenant_id', tenantId)
      .single()

    if (!animal) {
      return { error: 'Animal not found' }
    }

    // Verify appointment type belongs to tenant
    const { data: appointmentType } = await supabase
      .schema('calendar')
      .from('appointment_type')
      .select('id')
      .eq('id', validData.appointment_type_id)
      .eq('tenant_id', tenantId)
      .single()

    if (!appointmentType) {
      return { error: 'Appointment type not found' }
    }

    // Create appointment in calendar schema
    const { data: appointment, error } = await supabase
      .schema('calendar')
      .from('appointment')
      .insert({
        animal_id: validData.animal_id,
        appointment_type_id: validData.appointment_type_id,
        start_time: validData.start_time,
        end_time: validData.end_time,
        status: validData.status,
        notes: validData.notes,
        reason: validData.reason,
        tenant_id: tenantId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return { error: 'Failed to create appointment' }
    }

    // Create staff assignments
    const staffAssignments: AppointmentStaff[] = validData.staff_profile_ids.map(staffProfileId => ({
      appointment_id: appointment.id,
      staff_profile_id: staffProfileId,
      role: 'primary', // Default role
    }))

    const { error: staffError } = await supabase
      .schema('calendar')
      .from('appointment_staff')
      .insert(staffAssignments)

    if (staffError) {
      console.error('Error creating staff assignments:', staffError)
      // Rollback appointment creation
      await supabase
        .schema('calendar')
        .from('appointment')
        .delete()
        .eq('id', appointment.id)
      return { error: 'Failed to assign staff to appointment' }
    }

    // Revalidate calendar data
    revalidateTag('appointments')
    revalidatePath('/calendar')

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error in createAppointment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create appointment' }
  }
}

// Update an existing appointment
export async function updateAppointment(data: UpdateAppointmentData) {
  try {
    const tenantId = await getUserTenant()
    const supabase = await createClient()

    // Validate input data
    const validationResult = updateAppointmentSchema.safeParse(data)
    if (!validationResult.success) {
      return { error: 'Invalid data', details: validationResult.error.format() }
    }

    const { id, ...updateData } = validationResult.data

    // Verify appointment exists and belongs to tenant
    const { data: existingAppointment } = await supabase
      .schema('calendar')
      .from('appointment')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (!existingAppointment) {
      return { error: 'Appointment not found' }
    }

    // If updating time, validate and check availability
    if (updateData.start_time || updateData.end_time) {
      const startTime = updateData.start_time || existingAppointment.start_time
      const endTime = updateData.end_time || existingAppointment.end_time

      if (new Date(startTime) >= new Date(endTime)) {
        return { error: 'Start time must be before end time' }
      }

      // Get assigned staff for availability check
      const { data: assignedStaff } = await supabase
        .schema('calendar')
        .from('appointment_staff')
        .select('staff_profile_id')
        .eq('appointment_id', id)
        .limit(1)
        .single()

      if (assignedStaff) {
        const isAvailable = await checkStaffAvailability(
          assignedStaff.staff_profile_id,
          startTime,
          endTime,
          id
        )

        if (!isAvailable) {
          return { error: 'Staff member is not available at the selected time' }
        }
      }
    }

    // Update appointment
    const { data: appointment, error } = await supabase
      .schema('calendar')
      .from('appointment')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment:', error)
      return { error: 'Failed to update appointment' }
    }

    // Revalidate calendar data
    revalidateTag('appointments')
    revalidatePath('/calendar')

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error in updateAppointment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update appointment' }
  }
}

// Reschedule an appointment (optimized for drag-and-drop)
export async function rescheduleAppointment(data: RescheduleAppointmentData) {
  try {
    const tenantId = await getUserTenant()
    const supabase = await createClient()

    // Validate input data
    const validationResult = rescheduleAppointmentSchema.safeParse(data)
    if (!validationResult.success) {
      return { error: 'Invalid data', details: validationResult.error.format() }
    }

    const { id, start_time, end_time } = validationResult.data

    // Verify appointment exists and belongs to tenant
    const { data: existingAppointment } = await supabase
      .schema('calendar')
      .from('appointment')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (!existingAppointment) {
      return { error: 'Appointment not found' }
    }

    // Get assigned staff for this appointment
    const { data: assignedStaff } = await supabase
      .schema('calendar')
      .from('appointment_staff')
      .select('staff_profile_id')
      .eq('appointment_id', id)
      .limit(1)
      .single()

    // Validate times
    if (new Date(start_time) >= new Date(end_time)) {
      return { error: 'Start time must be before end time' }
    }

    // Check staff availability for the primary staff member
    const isAvailable = await checkStaffAvailability(
      assignedStaff?.staff_profile_id || '',
      start_time,
      end_time,
      id
    )

    if (!isAvailable) {
      return { error: 'Staff member is not available at the selected time' }
    }

    // Update appointment times
    const { data: appointment, error } = await supabase
      .schema('calendar')
      .from('appointment')
      .update({
        start_time,
        end_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error rescheduling appointment:', error)
      return { error: 'Failed to reschedule appointment' }
    }

    // Revalidate calendar data
    revalidateTag('appointments')
    revalidatePath('/calendar')

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error in rescheduleAppointment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to reschedule appointment' }
  }
}

// Delete an appointment
export async function deleteAppointment(appointmentId: string) {
  try {
    const tenantId = await getUserTenant()
    const supabase = await createClient()

    // Verify appointment exists and belongs to tenant
    const { data: existingAppointment } = await supabase
      .schema('calendar')
      .from('appointment')
      .select('id')
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .single()

    if (!existingAppointment) {
      return { error: 'Appointment not found' }
    }

    // Delete appointment (this will cascade to appointment_staff due to foreign key)
    const { error } = await supabase
      .schema('calendar')
      .from('appointment')
      .delete()
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting appointment:', error)
      return { error: 'Failed to delete appointment' }
    }

    // Revalidate calendar data
    revalidateTag('appointments')
    revalidatePath('/calendar')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteAppointment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to delete appointment' }
  }
}

// Update appointment status
export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const tenantId = await getUserTenant()
    const supabase = await createClient()

    // Verify appointment exists and belongs to tenant
    const { data: existingAppointment } = await supabase
      .schema('calendar')
      .from('appointment')
      .select('id')
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .single()

    if (!existingAppointment) {
      return { error: 'Appointment not found' }
    }

    // Update status
    const { data: appointment, error } = await supabase
      .schema('calendar')
      .from('appointment')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment status:', error)
      return { error: 'Failed to update appointment status' }
    }

    // Revalidate calendar data
    revalidateTag('appointments')
    revalidatePath('/calendar')

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update appointment status' }
  }
}