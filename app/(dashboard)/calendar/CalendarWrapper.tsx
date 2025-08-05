import { CalendarProvider } from './context/CalendarContext'
import { getStaffMembers, getAppointmentTypes } from '@/server/queries/appointments'
import CalendarContent from './CalendarContent'

export default async function CalendarWrapper() {
  const [staff, appointmentTypes] = await Promise.all([
    getStaffMembers(),
    getAppointmentTypes(),
  ])

  return (
    <CalendarProvider initialView="week">
      <CalendarContent 
        staff={staff} 
        appointmentTypes={appointmentTypes}
      />
    </CalendarProvider>
  )
}