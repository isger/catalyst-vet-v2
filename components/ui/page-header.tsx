import clsx from 'clsx'

interface PageHeaderProps {
  title: string
  children?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, children, actions, className }: PageHeaderProps) {
  return (
    <div className={clsx('relative border-b border-zinc-950/10 pb-5 sm:pb-0 dark:border-white/10', className)}>
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-white">{title}</h3>
        {actions && (
          <div className="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}