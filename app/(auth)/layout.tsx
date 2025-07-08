import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fallback protection - redirect to dashboard if already authenticated
  // This should rarely happen due to middleware, but provides extra security
  if (user) {
    redirect('/dashboard')
  }

  return (
      <main className="flex min-h-dvh flex-col p-2">
        <div
            className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
          {children}
        </div>
      </main>
  )
}