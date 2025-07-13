import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getSubdomainFromRequest, isReservedSubdomain } from '@/lib/tenant/subdomain'
import { cachedResolveTenantBySubdomain, cachedResolveTenantByDomain } from '@/lib/tenant/cache'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Handle subdomain routing first
  const subdomain = getSubdomainFromRequest(request.url, hostname)
  
  if (subdomain) {
    // Check if subdomain is reserved
    if (isReservedSubdomain(subdomain)) {
      return new NextResponse('Reserved subdomain', { status: 404 })
    }
    
    // Resolve tenant by subdomain
    const tenant = await cachedResolveTenantBySubdomain(subdomain)
    
    if (!tenant) {
      return new NextResponse('Tenant not found', { status: 404 })
    }
    
    // Add tenant information to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-id', tenant.id)
    requestHeaders.set('x-tenant-subdomain', tenant.subdomain)
    requestHeaders.set('x-tenant-name', tenant.name)
    
    // Continue with auth middleware with modified headers
    const response = await updateSession(
      new NextRequest(request.url, {
        headers: requestHeaders,
      })
    )
    
    // Add tenant info to response headers for client access
    if (response) {
      response.headers.set('x-tenant-id', tenant.id)
      response.headers.set('x-tenant-subdomain', tenant.subdomain)
      response.headers.set('x-tenant-name', tenant.name)
    }
    
    return response
  }
  
  // Check for custom domain
  const cleanHostname = hostname.replace(/:\d+$/, '')
  if (cleanHostname && !cleanHostname.includes('localhost') && !cleanHostname.includes('vercel.app')) {
    const tenant = await cachedResolveTenantByDomain(cleanHostname)
    
    if (tenant) {
      // Add tenant information to request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-tenant-id', tenant.id)
      requestHeaders.set('x-tenant-subdomain', tenant.subdomain)
      requestHeaders.set('x-tenant-name', tenant.name)
      requestHeaders.set('x-tenant-custom-domain', 'true')
      
      // Continue with auth middleware with modified headers
      const response = await updateSession(
        new NextRequest(request.url, {
          headers: requestHeaders,
        })
      )
      
      // Add tenant info to response headers for client access
      if (response) {
        response.headers.set('x-tenant-id', tenant.id)
        response.headers.set('x-tenant-subdomain', tenant.subdomain)
        response.headers.set('x-tenant-name', tenant.name)
        response.headers.set('x-tenant-custom-domain', 'true')
      }
      
      return response
    }
  }
  
  // No subdomain or custom domain - proceed with normal auth middleware
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}