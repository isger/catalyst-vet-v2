import { forwardRef, useState } from 'react'
import { Text } from '@/components/ui/text'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  maxLength?: number
  showCharCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, description, error, maxLength, showCharCount = false, className, ...props }, ref) => {
    const [charCount, setCharCount] = useState(props.defaultValue?.toString().length || 0)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-zinc-950 dark:text-white"
          >
            {label}
          </label>
        )}
        
        {description && (
          <Text className="text-zinc-600 dark:text-zinc-400">
            {description}
          </Text>
        )}
        
        <div className="relative">
          <span
            className={`
              relative block w-full
              before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow-sm
              dark:before:hidden
              after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset focus-within:after:ring-2 focus-within:after:ring-blue-500
              ${error ? 'after:ring-red-500 after:ring-2' : ''}
            `}
          >
            <textarea
              ref={ref}
              className={`
                relative block w-full appearance-none rounded-lg py-2
                px-[calc(theme(spacing.3.5)-1px)] py-[calc(theme(spacing.2.5)-1px)] 
                sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing.1.5)-1px)]
                text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white dark:placeholder:text-zinc-400
                border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20
                bg-transparent dark:bg-white/5
                focus:outline-hidden
                disabled:border-zinc-950/20 dark:disabled:border-white/15 dark:disabled:bg-white/2.5 dark:hover:disabled:border-white/15
                resize-vertical
                ${error ? 'border-red-500 hover:border-red-500 dark:border-red-500 dark:hover:border-red-500' : ''}
                ${className || ''}
              `}
              maxLength={maxLength}
              onChange={handleChange}
              {...props}
            />
          </span>
          
          {(showCharCount && maxLength) && (
            <div className="absolute bottom-2 right-2">
              <Text 
                className={`text-xs ${
                  charCount > maxLength * 0.9 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {charCount}/{maxLength}
              </Text>
            </div>
          )}
        </div>
        
        {error && (
          <Text className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </Text>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'