'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { signIn } from '@/server/actions/auth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof formSchema>

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button 
      type="submit" 
      className="w-full transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]" 
      disabled={isLoading}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
        )}
        <span className={`transition-all duration-200 ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </span>
      </div>
    </Button>
  )
}

export function SignInForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    
    try {
      const result = await signIn(data)
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        setIsLoading(false) // Only clear loading on error
      } else if (result?.success) {
        // Show success feedback while maintaining loading state
        toast({
          title: 'Success!',
          description: 'Signed in successfully. Redirecting...',
          variant: 'default',
        })
        // Navigate without clearing loading state - it will clear when component unmounts
        router.push('/dashboard')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in-0 duration-300">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="transition-all duration-200 ease-in-out focus:scale-[1.02] focus:shadow-md"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="transition-all duration-200 ease-in-out focus:scale-[1.02] focus:shadow-md"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isLoading={isLoading} />
      </form>
    </Form>
  )
}