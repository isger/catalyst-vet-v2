import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import type React from 'react'

interface WarningAlertProps {
  className?: string
  children: React.ReactNode
}

export function WarningAlert({ className, children }: WarningAlertProps) {
  return (
    <div className={clsx('border-l-4 border-yellow-400 bg-yellow-50 p-4', className)}>
      <div className="flex">
        <div className="shrink-0">
          <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {children}
          </p>
        </div>
      </div>
    </div>
  )
}

export function WarningAlertLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={clsx('font-medium text-yellow-700 underline hover:text-yellow-600', className)}>
      {children}
    </a>
  )
}