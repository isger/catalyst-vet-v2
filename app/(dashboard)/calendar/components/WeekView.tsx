import { useEffect, useRef, useMemo } from 'react'
import { useCalendar } from '../context/CalendarContext'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'

export default function WeekView() {
  const { state, openEditModal } = useCalendar()
  const container = useRef<HTMLDivElement>(null)
  const containerNav = useRef<HTMLDivElement>(null)
  const containerOffset = useRef<HTMLDivElement>(null)

  // Generate week days based on current date
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(state.currentDate, { weekStartsOn: 1 }) // Monday start
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      return {
        date,
        dayOfWeek: format(date, 'E'), // Mon, Tue, etc
        dayOfMonth: format(date, 'd'),
        isToday: isSameDay(date, new Date()),
        appointments: state.appointments.filter(apt => 
          isSameDay(parseISO(apt.start_time), date)
        )
      }
    })
  }, [state.currentDate, state.appointments])

  // Helper function to convert appointment time to grid row
  const getGridRowForTime = (timeString: string) => {
    const date = parseISO(timeString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    // Each hour has 2 rows (30min slots), starting from row 2 (after header)
    return (hours * 2) + Math.floor(minutes / 30) + 2
  }

  // Helper function to calculate appointment duration in grid rows
  const getGridSpanForDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = durationMs / (1000 * 60)
    // Each grid row represents 30 minutes
    return Math.max(1, Math.ceil(durationMinutes / 30))
  }

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
      <div ref={container} className="isolate flex flex-auto flex-col overflow-auto bg-white dark:bg-gray-900">
      <div style={{ width: '165%' }} className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
        <div
          ref={containerNav}
          className="sticky top-0 z-30 flex-none bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-gray-700 sm:pr-8"
        >
          <div className="grid grid-cols-7 text-sm/6 text-gray-500 dark:text-gray-400 sm:hidden">
            {weekDays.map((day, index) => (
              <button key={index} type="button" className="flex flex-col items-center pt-2 pb-3">
                {day.dayOfWeek.charAt(0)}
                <span className={`mt-1 flex size-8 items-center justify-center font-semibold ${
                  day.isToday 
                    ? 'rounded-full bg-indigo-600 text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {day.dayOfMonth}
                </span>
              </button>
            ))}
          </div>

          <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 dark:divide-gray-600 border-r border-gray-100 dark:border-gray-600 text-sm/6 text-gray-500 dark:text-gray-400 sm:grid">
            <div className="col-end-1 w-14" />
            {weekDays.map((day, index) => (
              <div key={index} className="flex items-center justify-center py-3">
                <span className={day.isToday ? "flex items-baseline" : ""}>
                  {day.dayOfWeek}{' '}
                  <span className={`${
                    day.isToday 
                      ? 'ml-1.5 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                      : 'items-center justify-center font-semibold text-gray-900 dark:text-gray-100'
                  }`}>
                    {day.dayOfMonth}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-auto">
          <div className="sticky left-0 z-10 w-14 flex-none bg-white dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-600" />
          <div className="grid flex-auto grid-cols-1 grid-rows-1">
            {/* Horizontal lines */}
            <div
              className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 dark:divide-gray-600"
              style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
            >
              <div ref={containerOffset} className="row-end-1 h-7"></div>
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  12AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  1AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  2AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  3AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  4AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  5AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  6AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  7AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  8AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  9AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  10AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  11AM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  12PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  1PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  2PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  3PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  4PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  5PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  6PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  7PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  8PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  9PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  10PM
                </div>
              </div>
              <div />
              <div>
                <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400 dark:text-gray-500">
                  11PM
                </div>
              </div>
              <div />
            </div>

            {/* Vertical lines */}
            <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 dark:divide-gray-600 sm:grid sm:grid-cols-7">
              <div className="col-start-1 row-span-full" />
              <div className="col-start-2 row-span-full" />
              <div className="col-start-3 row-span-full" />
              <div className="col-start-4 row-span-full" />
              <div className="col-start-5 row-span-full" />
              <div className="col-start-6 row-span-full" />
              <div className="col-start-7 row-span-full" />
              <div className="col-start-8 row-span-full w-8" />
            </div>

            {/* Events */}
            <ol
              className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
              style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
            >
              {weekDays.map((day, dayIndex) =>
                day.appointments.map((appointment) => {
                  const gridRow = getGridRowForTime(appointment.start_time)
                  const gridSpan = getGridSpanForDuration(appointment.start_time, appointment.end_time)
                  const startTime = parseISO(appointment.start_time)
                  
                  return (
                    <li
                      key={appointment.id}
                      className={`relative mt-px flex ${dayIndex === 0 ? 'sm:col-start-1' : `sm:col-start-${dayIndex + 1}`}`}
                      style={{ gridRow: `${gridRow} / span ${gridSpan}` }}
                    >
                      <button
                        className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs/5 transition-colors"
                        style={{
                          backgroundColor: appointment.color ? `${appointment.color}20` : 'rgb(244 244 245 / 0.5)', // zinc-100 with opacity
                          borderLeft: appointment.color ? `3px solid ${appointment.color}` : '3px solid #71717a'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = appointment.color ? `${appointment.color}30` : 'rgb(228 228 231 / 0.5)' // zinc-200 with opacity
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = appointment.color ? `${appointment.color}20` : 'rgb(244 244 245 / 0.5)' // zinc-100 with opacity
                        }}
                        onClick={() => {
                          openEditModal(appointment)
                        }}
                      >
                        <p className="order-1 font-semibold truncate text-zinc-700 dark:text-zinc-300" style={{ color: appointment.color ? appointment.color : undefined }}>
                          {appointment.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                          <time dateTime={appointment.start_time}>
                            {format(startTime, 'h:mm a')}
                          </time>
                          {appointment.owner && (
                            <span className="block truncate">
                              {appointment.owner.first_name} {appointment.owner.last_name}
                            </span>
                          )}
                        </p>
                        {appointment.animal && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs truncate">
                            {appointment.animal.name} ({appointment.animal.species})
                          </p>
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}