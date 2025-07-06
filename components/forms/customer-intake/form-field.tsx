import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  id: string
  error?: string
  required?: boolean
  helpText?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ 
  label, 
  id, 
  error, 
  required = false, 
  helpText, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        {children}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon 
              className="h-5 w-5 text-red-500" 
              aria-hidden="true" 
            />
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        // Base styles
        'block w-full px-3 py-2 text-sm rounded-md border transition-colors duration-200',
        // Light mode
        'border-gray-300 bg-white text-gray-900 placeholder-gray-500',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none',
        // Dark mode
        'dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
        'dark:focus:border-blue-400 dark:focus:ring-blue-400',
        // Disabled state
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900',
        // Error state
        error && [
          'border-red-300 text-red-900 placeholder-red-400',
          'focus:border-red-500 focus:ring-red-500',
          'dark:border-red-500 dark:text-red-100 dark:placeholder-red-400'
        ],
        className
      )}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  children: React.ReactNode
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        // Base styles
        'block w-full px-3 py-2 text-sm rounded-md border transition-colors duration-200',
        // Light mode
        'border-gray-300 bg-white text-gray-900',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none',
        // Dark mode
        'dark:bg-gray-800 dark:border-gray-600 dark:text-white',
        'dark:focus:border-blue-400 dark:focus:ring-blue-400',
        // Disabled state
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900',
        // Error state
        error && [
          'border-red-300 text-red-900',
          'focus:border-red-500 focus:ring-red-500',
          'dark:border-red-500 dark:text-red-100'
        ],
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        // Base styles
        'block w-full px-3 py-2 text-sm rounded-md border transition-colors duration-200 resize-vertical',
        // Light mode
        'border-gray-300 bg-white text-gray-900 placeholder-gray-500',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none',
        // Dark mode
        'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
        'dark:focus:border-blue-400 dark:focus:ring-blue-400',
        // Disabled state
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-900',
        // Error state
        error && [
          'border-red-300 text-red-900 placeholder-red-400',
          'focus:border-red-500 focus:ring-red-500',
          'dark:border-red-500 dark:text-red-100 dark:placeholder-red-400'
        ],
        className
      )}
      {...props}
    />
  )
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
}

export function Checkbox({ label, description, error, className, ...props }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              // Base styles
              'h-4 w-4 rounded border transition-colors duration-200',
              // Light mode
              'border-gray-300 bg-white text-blue-600',
              'focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none',
              'checked:bg-blue-600 checked:border-blue-600',
              // Dark mode
              'dark:bg-gray-800 dark:border-gray-600',
              'dark:focus:ring-blue-400 dark:checked:bg-blue-500 dark:checked:border-blue-500',
              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Error state
              error && [
                'border-red-300 focus:ring-red-500',
                'dark:border-red-500 dark:focus:ring-red-400'
              ],
              className
            )}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={props.id} className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}