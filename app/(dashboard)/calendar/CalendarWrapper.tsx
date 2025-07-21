import { CalendarProvider } from './context/CalendarContext'
import { getStaffMembers, getCustomersWithAnimals, getAppointmentTypes } from '@/server/queries/appointments'
import CalendarContent from './CalendarContent'

export default async function CalendarWrapper() {
  const [staff, customers, appointmentTypes] = await Promise.all([
    getStaffMembers(),
    getCustomersWithAnimals(),
    getAppointmentTypes(),
  ])

  return (
    <CalendarProvider initialView="week">
      <CalendarContent 
        staff={staff} 
        customers={customers} 
        appointmentTypes={appointmentTypes}
      />
    </CalendarProvider>
  )
}