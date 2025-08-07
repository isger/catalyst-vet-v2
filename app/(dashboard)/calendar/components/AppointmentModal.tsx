'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createAppointment, type CreateAppointmentData } from '@/server/actions/appointments'
import { useCalendar } from '../context/CalendarContext'
import type { StaffMember } from '@/server/queries/appointments'
import CustomerSearchCombobox from './CustomerSearchCombobox'
import AnimalSearchCombobox from './AnimalSearchCombobox'
import StaffSelectionCombobox from './StaffSelectionCombobox'

// Form validation schema - updated for new calendar schema
const appointmentSchema = z.object({
  animal_id: z.string().min(1, 'Animal is required'),
  appointment_type_id: z.string().min(1, 'Appointment type is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  status: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
  staff_profile_ids: z.array(z.string()).min(1, 'At least one staff member is required'),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

// Appointment statuses
const appointmentStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

interface AppointmentType {
  id: string
  name: string
  description: string | null
  duration: number
  color: string | null
  default_room_type: string | null
  requires_equipment: boolean | null
}

interface AppointmentModalProps {
  staff: StaffMember[]
  appointmentTypes: AppointmentType[]
}

export default function AppointmentModal({ staff, appointmentTypes }: AppointmentModalProps) {
  const {
    state: { 
      showCreateModal, 
      showEditModal, 
      selectedAppointment, 
      selectedDate,
      currentDate 
    },
    closeModals,
    refreshData
  } = useCalendar()

  const [isPending, startTransition] = useTransition()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    animals: Array<{
      id: string
      name: string
      species: string
      breed: string | null
    }>
  } | null>(null)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('')
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])

  const isEditing = showEditModal && selectedAppointment
  const isOpen = showCreateModal || showEditModal

  // Initialize form
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      animal_id: '',
      appointment_type_id: '',
      start_time: '',
      end_time: '',
      status: 'scheduled',
      notes: '',
      reason: '',
      staff_profile_ids: [],
    },
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && selectedAppointment) {
        // For editing, we'd need to populate the form with existing data
        // This would require additional queries to get the full appointment details
        const startTime = new Date(selectedAppointment.start_time)
        const endTime = new Date(selectedAppointment.end_time)
        
        form.reset({
          animal_id: selectedAppointment.animal?.id || '',
          appointment_type_id: '', // Would need to map from appointment type name to ID
          start_time: formatDateTimeLocal(startTime),
          end_time: formatDateTimeLocal(endTime),
          status: selectedAppointment.status,
          notes: selectedAppointment.notes || '',
          reason: selectedAppointment.description || '',
          staff_profile_ids: [], // Would need to get from staff assignments
        })

        if (selectedAppointment.owner) {
          setSelectedCustomerId(selectedAppointment.owner.id)
          // Note: We'd need to fetch the full customer object here in a real implementation
        }
      } else {
        // Reset form for new appointment
        const defaultStartTime = selectedDate || currentDate
        const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000) // 1 hour later
        
        form.reset({
          animal_id: '',
          appointment_type_id: appointmentTypes.length > 0 ? appointmentTypes[0].id : '',
          start_time: formatDateTimeLocal(defaultStartTime),
          end_time: formatDateTimeLocal(defaultEndTime),
          status: 'scheduled',
          notes: '',
          reason: '',
          staff_profile_ids: staff.length > 0 ? [staff[0].id] : [],
        })
        setSelectedCustomerId('')
        setSelectedCustomer(null)
        setSelectedAnimalId('')
        setSelectedStaffIds(staff.length > 0 ? [staff[0].id] : [])
      }
    } else {
      form.reset()
      setSelectedCustomerId('')
      setSelectedCustomer(null)
      setSelectedAnimalId('')
      setSelectedStaffIds([])
    }
  }, [isOpen, isEditing, selectedAppointment, selectedDate, currentDate, staff, appointmentTypes, form])

  // Handle customer selection and animal updates
  const handleCustomerSelect = (customer: unknown) => {
    setSelectedCustomer(customer as typeof selectedCustomer)
    
    // Clear animal selection when customer changes
    setSelectedAnimalId('')
    form.setValue('animal_id', '')
  }

  // Handle animal selection
  const handleAnimalSelect = (animal: { id: string } | null) => {
    form.setValue('animal_id', animal?.id || '')
  }

  // Handle staff selection changes
  const handleStaffSelectionChange = (staffIds: string[]) => {
    setSelectedStaffIds(staffIds)
    form.setValue('staff_profile_ids', staffIds)
  }

  // Format date for datetime-local input
  function formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Handle form submission
  const onSubmit = async (data: AppointmentFormData) => {
    startTransition(async () => {
      try {
        // Validate that end time is after start time
        const startTime = new Date(data.start_time)
        const endTime = new Date(data.end_time)
        
        if (endTime <= startTime) {
          form.setError('end_time', {
            type: 'manual',
            message: 'End time must be after start time'
          })
          return
        }

        if (isEditing && selectedAppointment) {
          // Update existing appointment - would need update action
          toast.error('Edit functionality not yet implemented')
        } else {
          // Create new appointment
          const createData: CreateAppointmentData = {
            animal_id: data.animal_id,
            appointment_type_id: data.appointment_type_id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: data.status || 'scheduled',
            notes: data.notes,
            reason: data.reason,
            staff_profile_ids: data.staff_profile_ids,
          }

          const result = await createAppointment(createData)
          
          if (result.error) {
            toast.error('Failed to create appointment', {
              description: result.error
            })
          } else {
            toast.success('Appointment created successfully')
            closeModals()
            await refreshData()
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
        console.error('Error submitting appointment:', error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onClose={closeModals} size="4xl">
      <DialogTitle>
        {isEditing ? 'Edit Appointment' : 'Create New Appointment'}
      </DialogTitle>
      <DialogDescription>
        {isEditing 
          ? 'Update the appointment details below.'
          : 'Fill in the details to create a new appointment.'
        }
      </DialogDescription>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="space-y-6">
          {/* Customer and Animal Selection */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <CustomerSearchCombobox
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  onCustomerSelect={handleCustomerSelect}
                  placeholder="Search for a customer..."
                  label="Customer"
                />
              </div>

              <div>
                <AnimalSearchCombobox
                  value={selectedAnimalId}
                  onChange={setSelectedAnimalId}
                  onAnimalSelect={handleAnimalSelect}
                  placeholder={selectedCustomer ? 'Search animals...' : 'Search all animals...'}
                  label="Animal"
                  error={form.formState.errors.animal_id?.message}
                  disabled={false}
                  ownerId={selectedCustomer?.id}
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="block mb-2">Appointment Type</Label>
                <Select {...form.register('appointment_type_id')}>
                  <option value="">Select appointment type</option>
                  {appointmentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.duration} min)
                    </option>
                  ))}
                </Select>
                {form.formState.errors.appointment_type_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.appointment_type_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="block mb-2">Status</Label>
                <Select {...form.register('status')}>
                  {appointmentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Visit
              </label>
              <Textarea
                {...form.register('reason')}
                placeholder="Enter the reason for this appointment"
                rows={2}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  {...form.register('start_time')}
                  type="datetime-local"
                  label="Start Time"
                />
                {form.formState.errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.start_time.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...form.register('end_time')}
                  type="datetime-local"
                  label="End Time"
                />
                {form.formState.errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.end_time.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div className="space-y-4">
            <div>
              <StaffSelectionCombobox
                staff={staff}
                selectedStaffIds={selectedStaffIds}
                onSelectionChange={handleStaffSelectionChange}
                label="Assigned Staff (select one or more)"
                error={form.formState.errors.staff_profile_ids?.message}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Internal Notes
              </label>
              <Textarea
                {...form.register('notes')}
                placeholder="Any additional notes for staff (optional)"
                rows={3}
              />
            </div>
          </div>
        </DialogBody>

        <DialogActions>
          <Button 
            type="button" 
            outline
            onClick={closeModals}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
          >
            {isPending 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Appointment' : 'Create Appointment')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}