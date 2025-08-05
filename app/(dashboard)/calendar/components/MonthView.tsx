import { ClockIcon } from '@heroicons/react/20/solid'
import { useCalendar } from '../context/CalendarContext'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { useMemo } from 'react'

// This will be replaced with dynamic content in the component

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function MonthView() {
  const { state, openEditModal, setSelectedDate } = useCalendar()

  // Generate month calendar days based on current date
  const days = useMemo(() => {
    const monthStart = startOfMonth(state.currentDate)
    const monthEnd = endOfMonth(state.currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return allDays.map(date => {
      const dayAppointments = state.appointments.filter(apt => 
        isSameDay(parseISO(apt.start_time), date)
      )

      return {
        date: format(date, 'yyyy-MM-dd'),
        dateObj: date,
        isCurrentMonth: isSameMonth(date, state.currentDate),
        isToday: isToday(date),
        isSelected: state.selectedDate ? isSameDay(date, state.selectedDate) : false,
        events: dayAppointments.map(apt => ({
          id: apt.id,
          name: apt.title,
          time: format(parseISO(apt.start_time), 'h:mm a'),
          datetime: apt.start_time,
          color: apt.color,
          appointment: apt
        }))
      }
    })
  }, [state.currentDate, state.appointments, state.selectedDate])

  const selectedDay = days.find((day) => day.isSelected)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-auto">
        <div className="lg:flex lg:h-full lg:flex-col">
      <div className="shadow-sm ring-1 ring-black/5 dark:ring-gray-700 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-center text-xs/6 font-semibold text-gray-700 dark:text-gray-300 lg:flex-none">
          <div className="bg-white dark:bg-gray-800 py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
          <div className="bg-white dark:bg-gray-800 py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
        </div>
        <div className="flex bg-gray-200 dark:bg-gray-700 text-xs/6 text-gray-700 dark:text-gray-300 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
            {days.map((day) => (
              <div
                key={day.date}
                className={classNames(
                  day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                  'relative px-3 py-2',
                )}
              >
                <time
                  dateTime={day.date}
                  className={
                    day.isToday
                      ? 'flex size-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                      : undefined
                  }
                >
                  {day.date.split('-').pop()?.replace(/^0/, '')}
                </time>
                {day.events.length > 0 && (
                  <ol className="mt-2">
                    {day.events.slice(0, 2).map((event) => (
                      <li key={event.id}>
                        <button 
                          onClick={() => {
                            openEditModal(event.appointment)
                          }}
                          className="group flex w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 -m-1"
                        >
                          <p 
                            className="flex-auto truncate font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600"
                            style={{ color: event.color || undefined }}
                          >
                            {event.name}
                          </p>
                          <time
                            dateTime={event.datetime}
                            className="ml-3 hidden flex-none text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 xl:block"
                          >
                            {event.time}
                          </time>
                        </button>
                      </li>
                    ))}
                    {day.events.length > 2 && <li className="text-gray-500 dark:text-gray-400">+ {day.events.length - 2} more</li>}
                  </ol>
                )}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.dateObj)}
                className={classNames(
                  day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700',
                  (day.isSelected || day.isToday) && 'font-semibold',
                  day.isSelected && 'text-white',
                  !day.isSelected && day.isToday && 'text-indigo-600',
                  !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900 dark:text-gray-100',
                  !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500 dark:text-gray-400',
                  'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:z-10',
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    day.isSelected && 'flex size-6 items-center justify-center rounded-full',
                    day.isSelected && day.isToday && 'bg-indigo-600',
                    day.isSelected && !day.isToday && 'bg-gray-900 dark:bg-gray-600',
                    'ml-auto',
                  )}
                >
                  {day.date.split('-').pop()?.replace(/^0/, '')}
                </time>
                <span className="sr-only">{day.events.length} events</span>
                {day.events.length > 0 && (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {day.events.map((event) => (
                      <span 
                        key={event.id} 
                        className="mx-0.5 mb-1 size-1.5 rounded-full"
                        style={{ backgroundColor: event.color || '#6b7280' }}
                      />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedDay?.events.length && selectedDay.events.length > 0 && (
        <div className="px-4 py-10 sm:px-6 lg:hidden">
          <ol className="divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-sm shadow-sm ring-1 ring-black/5 dark:ring-gray-600">
            {selectedDay.events.map((event) => (
              <li key={event.id} className="group flex p-4 pr-6 focus-within:bg-gray-50 dark:focus-within:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex-auto">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{event.name}</p>
                  <time dateTime={event.datetime} className="mt-2 flex items-center text-gray-700 dark:text-gray-300">
                    <ClockIcon className="mr-2 size-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                    {event.time}
                  </time>
                  {event.appointment.owner && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {event.appointment.owner.first_name} {event.appointment.owner.last_name}
                    </p>
                  )}
                  {event.appointment.animal && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                      {event.appointment.animal.name} ({event.appointment.animal.species})
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    openEditModal(event.appointment)
                  }}
                  className="ml-6 flex-none self-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 opacity-0 shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset group-hover:opacity-100 hover:ring-gray-400 dark:hover:ring-gray-500 focus:opacity-100"
                >
                  View<span className="sr-only">, {event.name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}