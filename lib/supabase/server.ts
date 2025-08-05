import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'


export const createClient = async () => {
  const cookieStore = await cookies()

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
      auth: {
        persistSession: false, // Don't persist on server
        autoRefreshToken: false, // Don't auto-refresh on server
      },
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

export const createAdminClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'catalyst-vet-admin'
        }
      }
    }
  )
}