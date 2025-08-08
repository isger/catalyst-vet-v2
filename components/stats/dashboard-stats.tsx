import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

const stats = [
  { name: 'Total Patients', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' as const },
  { name: 'Active Appointments', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' as const },
  { name: 'Treatment Success Rate', stat: '94.57%', previousStat: '91.62%', change: '2.95%', changeType: 'increase' as const },
]

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function DashboardStats() {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Last 30 days</h3>
      <dl className="mt-5 grid grid-cols-1 divide-gray-200 dark:divide-gray-700 overflow-hidden rounded-lg bg-white dark:bg-zinc-800 shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((item) => (
          <div key={item.name} className="px-4 py-5 sm:p-6">
            <dt className="text-base font-normal text-gray-900 dark:text-gray-100">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {item.stat}
                <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">from {item.previousStat}</span>
              </div>

              <div
                className={classNames(
                  item.changeType === 'increase' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
                  'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0',
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon aria-hidden="true" className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-green-500 dark:text-green-400" />
                ) : (
                  <ArrowDownIcon aria-hidden="true" className="mr-0.5 -ml-1 size-5 shrink-0 self-center text-red-500 dark:text-red-400" />
                )}

                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}