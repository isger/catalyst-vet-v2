import { useEffect, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useCalendar } from '../context/CalendarContext'
import type { AppointmentWithDetails } from '@/server/queries/appointments'

// Helper function to generate calendar days for mini calendar
function generateCalendarDays(currentDate: Date) {
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of the month
  const firstDay = new Date(year, month, 1)
  // Get last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Get first day of the week (Monday = 1, Sunday = 0)
  const firstWeekDay = firstDay.getDay()
  const daysFromPreviousMonth = firstWeekDay === 0 ? 6 : firstWeekDay - 1
  
  // Generate all days for the calendar grid
  const days = []
  
  // Previous month's days
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = daysFromPreviousMonth; i > 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i + 1)
    days.push({
      date: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }
  
  // Current month's days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    const todayString = today.toISOString().split('T')[0]
    const currentDateString = currentDate.toISOString().split('T')[0]
    
    days.push({
      date: dateString,
      isCurrentMonth: true,
      isToday: dateString === todayString,
      isSelected: dateString === currentDateString,
    })
  }
  
  // Next month's days to fill the grid
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }
  
  return days
}

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Helper function to calculate grid position for appointments
function getAppointmentGridPosition(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  // Calculate minutes from midnight
  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()
  
  // Grid has 288 rows (24 hours * 12 five-minute intervals) + 1 offset row
  // Each row represents 5 minutes
  const startRow = Math.floor(startMinutes / 5) + 2 // +2 for offset row
  const duration = Math.max(1, Math.floor((endMinutes - startMinutes) / 5)) // Minimum 1 row
  
  return {
    gridRow: `${startRow} / span ${duration}`,
  }
}

// Helper function to format time for display
function formatAppointmentTime(startTime: string) {
  return new Date(startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Helper function to filter appointments for the current day
function getAppointmentsForDay(appointments: AppointmentWithDetails[], currentDate: Date) {
  const dayStart = new Date(currentDate)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(currentDate)
  dayEnd.setHours(23, 59, 59, 999)
  
  console.log('Filtering appointments for day:')
  console.log('Day start:', dayStart.toISOString())
  console.log('Day end:', dayEnd.toISOString())
  
  const filtered = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start_time)
    const isInRange = appointmentDate >= dayStart && appointmentDate <= dayEnd
    
    console.log(`Appointment "${appointment.title}":`)
    console.log(`  Start time: ${appointment.start_time}`)
    console.log(`  Parsed date: ${appointmentDate.toISOString()}`)
    console.log(`  In range: ${isInRange}`)
    
    return isInRange
  })
  
  console.log(`Filtered ${filtered.length} appointments from ${appointments.length} total`)
  return filtered
}

export default function DayView() {
  const { state, openEditModal, navigatePrevious, navigateNext, setCurrentDate } = useCalendar()
  const { appointments, currentDate, isLoading, error } = state
  
  const container = useRef<HTMLDivElement>(null)
  const containerNav = useRef<HTMLDivElement>(null)
  const containerOffset = useRef<HTMLDivElement>(null)
  
  // Get appointments for the current day
  const dayAppointments = getAppointmentsForDay(appointments, currentDate)
  
  // Generate calendar days for mini calendar
  const calendarDays = generateCalendarDays(currentDate)
  
  // Debug logging
  console.log('=== DayView Debug Info ===')
  console.log('Calendar state:')
  console.log('  - isLoading:', isLoading)
  console.log('  - error:', error)
  console.log('  - currentDate:', currentDate)
  console.log('  - currentDate ISO:', currentDate.toISOString())
  console.log('  - appointments count:', appointments.length)
  console.log('  - dayAppointments count:', dayAppointments.length)
  
  console.log('All appointments:', appointments)
  console.log('Day appointments:', dayAppointments)
  
  const dayStart = new Date(currentDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(currentDate)
  dayEnd.setHours(23, 59, 59, 999)
  console.log('Day range:')
  console.log('  - Start:', dayStart.toISOString())
  console.log('  - End:', dayEnd.toISOString())
  
  if (appointments.length > 0) {
    console.log('First appointment details:')
    console.log('  - Title:', appointments[0].title)
    console.log('  - Start time:', appointments[0].start_time)
    console.log('  - Parsed date:', new Date(appointments[0].start_time).toISOString())
    console.log('  - Staff:', appointments[0].staff)
    console.log('  - Color:', appointments[0].color)
  }
  
  console.log('==========================')

  useEffect(() => {
    // Set the container scroll position based on the current time.
    const currentMinute = new Date().getHours() * 60
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight - containerNav.current.offsetHeight - containerOffset.current.offsetHeight) *
          currentMinute) /
        1440
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="isolate flex flex-auto overflow-hidden bg-white dark:bg-gray-900">
        <div ref={container} className="flex flex-auto flex-col overflow-auto">
          <div
            ref={containerNav}
            className="sticky top-0 z-10 flex justify-center bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 shadow-sm ring-1 ring-black/5 dark:ring-gray-700 md:hidden"
          >
            <div className="flex flex-col items-center pt-3 pb-1.5">
              <span className="text-sm font-medium">
                {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="mt-2 flex size-10 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-600 text-lg font-semibold text-white">
                {currentDate.getDate()}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-auto">
            <div className="w-14 flex-none bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-600" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 dark:divide-gray-600"
                style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
              >
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">12AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">1AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">2AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">3AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">4AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">5AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">6AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">7AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">8AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">9AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">10AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">11AM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">12PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">1PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">2PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">3PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">4PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">5PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">6PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">7PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">8PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">9PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">10PM</div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">11PM</div>
                </div>
                <div />
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
                style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
              >
                {/* Debug info overlay */}
                <li className="relative mt-px flex" style={{ gridRow: '2 / span 4' }}>
                  <div className="absolute inset-1 flex flex-col rounded-lg bg-yellow-50 p-2 text-xs border border-yellow-200">
                    <p className="font-semibold text-yellow-800">Debug Info:</p>
                    <p className="text-yellow-700">Loading: {isLoading ? 'Yes' : 'No'}</p>
                    <p className="text-yellow-700">Error: {error || 'None'}</p>
                    <p className="text-yellow-700">Total: {appointments.length}</p>
                    <p className="text-yellow-700">Today: {dayAppointments.length}</p>
                  </div>
                </li>
                
                {dayAppointments.map((appointment) => {
                  const gridPosition = getAppointmentGridPosition(appointment.start_time, appointment.end_time)
                  const appointmentColor = appointment.color || appointment.staff.color || '#71717a'
                  
                  // Generate color classes based on the appointment color
                  const getColorClasses = (color: string) => {
                    // Default to zinc if no valid color
                    if (!color || color === '#3B82F6' || color === '#71717a') {
                      return {
                        bg: 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700',
                        textPrimary: 'text-zinc-700 dark:text-zinc-300',
                        textSecondary: 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300'
                      }
                    }
                    
                    // For custom colors, use style attribute for background
                    return {
                      bg: '',
                      textPrimary: 'text-gray-900 dark:text-gray-100',
                      textSecondary: 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }
                  }
                  
                  const colorClasses = getColorClasses(appointmentColor)
                  const customStyle = colorClasses.bg === '' ? {
                    backgroundColor: `${appointmentColor}20`, // 20% opacity
                    '--hover-bg': `${appointmentColor}30`
                  } as React.CSSProperties : {}
                  
                  return (
                    <li 
                      key={appointment.id} 
                      className="relative mt-px flex" 
                      style={gridPosition}
                    >
                      <button
                        onClick={() => openEditModal(appointment)}
                        className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs/5 ${colorClasses.bg} ${colorClasses.bg === '' ? 'hover:opacity-80' : ''}`}
                        style={customStyle}
                      >
                        <p className={`order-1 font-semibold ${colorClasses.textPrimary}`}>
                          {appointment.title}
                        </p>
                        {appointment.description && (
                          <p className={`order-1 ${colorClasses.textSecondary}`}>
                            {appointment.description}
                          </p>
                        )}
                        <p className={colorClasses.textSecondary}>
                          <time dateTime={appointment.start_time}>
                            {formatAppointmentTime(appointment.start_time)}
                          </time>
                        </p>
                        {appointment.staff.first_name && (
                          <p className={`order-1 text-xs ${colorClasses.textSecondary}`}>
                            {appointment.staff.first_name} {appointment.staff.last_name}
                          </p>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
        <div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 dark:border-gray-600 px-8 py-10 md:block">
          <div className="flex items-center text-center text-gray-900 dark:text-gray-100">
            <button
              type="button"
              onClick={navigatePrevious}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Previous day</span>
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <div className="flex-auto text-sm font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <button
              type="button"
              onClick={navigateNext}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Next day</span>
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-center text-xs/6 text-gray-500 dark:text-gray-400">
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 dark:bg-gray-700 text-sm shadow-sm ring-1 ring-gray-200 dark:ring-gray-600">
            {calendarDays.map((day, dayIdx) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setCurrentDate(new Date(day.date + 'T12:00:00'))}
                className={classNames(
                  'py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 focus:z-10',
                  day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700',
                  (day.isSelected || day.isToday) && 'font-semibold',
                  day.isSelected && 'text-white',
                  !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900 dark:text-gray-100',
                  !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-400 dark:text-gray-500',
                  day.isToday && !day.isSelected && 'text-indigo-600',
                  dayIdx === 0 && 'rounded-tl-lg',
                  dayIdx === 6 && 'rounded-tr-lg',
                  dayIdx === calendarDays.length - 7 && 'rounded-bl-lg',
                  dayIdx === calendarDays.length - 1 && 'rounded-br-lg',
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    'mx-auto flex size-7 items-center justify-center rounded-full',
                    day.isSelected && day.isToday && 'bg-indigo-600',
                    day.isSelected && !day.isToday && 'bg-gray-900 dark:bg-gray-600',
                  )}
                >
                  {day.date.split('-').pop()?.replace(/^0/, '')}
                </time>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}