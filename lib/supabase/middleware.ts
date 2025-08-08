import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({
              request,
            })
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname === '/' || url.pathname.startsWith('/signin') || url.pathname.startsWith('/signup')
  
  // Dashboard routes include all routes that need authentication
  const dashboardRoutes = ['/dashboard', '/calendar', '/orders', '/events', '/customers', '/settings']
  const isDashboardPage = dashboardRoutes.some(route => url.pathname.startsWith(route))

  // Redirect authenticated users away from auth pages (including root path)
  if (user && isAuthPage) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to root (login page) for protected routes
  if (!user && isDashboardPage) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}