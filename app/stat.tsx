import clsx from 'clsx'

export function Stat({ 
  title, 
  value, 
  change, 
  className 
}: { 
  title: string
  value: string
  change?: string
  className?: string
}) {
  const isPositive = change?.startsWith('+')
  const isNegative = change?.startsWith('-')
  
  return (
    <div className={clsx(
      'rounded-xl border border-zinc-950/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900',
      className
    )}>
      <div className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl/8 font-semibold text-zinc-950 dark:text-white">
          {value}
        </div>
        {change && (
          <div className={clsx(
            'text-sm/6 font-medium',
            isPositive && 'text-green-600 dark:text-green-400',
            isNegative && 'text-red-600 dark:text-red-400',
            !isPositive && !isNegative && 'text-zinc-500 dark:text-zinc-400'
          )}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}