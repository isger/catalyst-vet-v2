import { useEffect, useRef } from 'react'

export default function WeekView() {
  const container = useRef<HTMLDivElement>(null)
  const containerNav = useRef<HTMLDivElement>(null)
  const containerOffset = useRef<HTMLDivElement>(null)

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
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              M <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">10</span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              T <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">11</span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              W{' '}
              <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                12
              </span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              T <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">13</span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              F <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">14</span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              S <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">15</span>
            </button>
            <button type="button" className="flex flex-col items-center pt-2 pb-3">
              S <span className="mt-1 flex size-8 items-center justify-center font-semibold text-gray-900 dark:text-gray-100">16</span>
            </button>
          </div>

          <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 dark:divide-gray-600 border-r border-gray-100 dark:border-gray-600 text-sm/6 text-gray-500 dark:text-gray-400 sm:grid">
            <div className="col-end-1 w-14" />
            <div className="flex items-center justify-center py-3">
              <span>
                Mon <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">10</span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span>
                Tue <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">11</span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span className="flex items-baseline">
                Wed{' '}
                <span className="ml-1.5 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                  12
                </span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span>
                Thu <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">13</span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span>
                Fri <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">14</span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span>
                Sat <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">15</span>
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <span>
                Sun <span className="items-center justify-center font-semibold text-gray-900 dark:text-gray-100">16</span>
              </span>
            </div>
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
              <li className="relative mt-px flex sm:col-start-3" style={{ gridRow: '74 / span 12' }}>
                <a
                  href="#"
                  className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs/5 hover:bg-blue-100"
                >
                  <p className="order-1 font-semibold text-blue-700">Breakfast</p>
                  <p className="text-blue-500 group-hover:text-blue-700">
                    <time dateTime="2022-01-12T06:00">6:00 AM</time>
                  </p>
                </a>
              </li>
              <li className="relative mt-px flex sm:col-start-3" style={{ gridRow: '92 / span 30' }}>
                <a
                  href="#"
                  className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-pink-50 p-2 text-xs/5 hover:bg-pink-100"
                >
                  <p className="order-1 font-semibold text-pink-700">Flight to Paris</p>
                  <p className="text-pink-500 group-hover:text-pink-700">
                    <time dateTime="2022-01-12T07:30">7:30 AM</time>
                  </p>
                </a>
              </li>
              <li className="relative mt-px hidden sm:col-start-6 sm:flex" style={{ gridRow: '122 / span 24' }}>
                <a
                  href="#"
                  className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-gray-100 p-2 text-xs/5 hover:bg-gray-200"
                >
                  <p className="order-1 font-semibold text-gray-700">Meeting with design team at Disney</p>
                  <p className="text-gray-500 group-hover:text-gray-700">
                    <time dateTime="2022-01-15T10:00">10:00 AM</time>
                  </p>
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}