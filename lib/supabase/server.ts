import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'


export const createClient = async () => {
  const cookieStore = await cookies()
  
  // Create a fresh client for each request to ensure proper cookie handling
  // but use optimized configuration for better performance
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      // Optimize for server-side usage
      auth: {
        persistSession: false, // Don't persist on server
        autoRefreshToken: false, // Don't auto-refresh on server
      },
      // Enable connection pooling
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'catalyst-vet-server'
        }
      }
    }
  )
}