import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getSubdomainFromRequest, isReservedSubdomain } from '@/lib/tenant/subdomain'
import { cachedResolveTenantBySubdomain, cachedResolveTenantByDomain } from '@/lib/tenant/cache'

async function handleTenantRequest(
    request: NextRequest,
    tenant: { id: string; subdomain: string; name: string },
    isCustomDomain = false
): Promise<NextResponse> {
  // Create headers once
  const headers = new Headers(request.headers)
  headers.set('x-tenant-id', tenant.id)
  headers.set('x-tenant-subdomain', tenant.subdomain)
  headers.set('x-tenant-name', tenant.name)

  if (isCustomDomain) {
    headers.set('x-tenant-custom-domain', 'true')
  }

  // Create new request with modified headers
  const modifiedRequest = new NextRequest(request.url, { headers })

  // Run auth middleware
  const response = await updateSession(modifiedRequest)

  // If response exists, add tenant headers
  if (response) {
    response.headers.set('x-tenant-id', tenant.id)
    response.headers.set('x-tenant-subdomain', tenant.subdomain)
    response.headers.set('x-tenant-name', tenant.name)

    if (isCustomDomain) {
      response.headers.set('x-tenant-custom-domain', 'true')
    }
  }

  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip tenant resolution for static assets and API routes
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.')) {
    return await updateSession(request)
  }

  const hostname = request.headers.get('host')
  if (!hostname) {
    return await updateSession(request)
  }

  // Handle subdomain routing
  const subdomain = getSubdomainFromRequest(request.url, hostname)

  if (subdomain) {
    // Check reserved subdomains first
    if (isReservedSubdomain(subdomain)) {
      return new NextResponse('Reserved subdomain', { status: 404 })
    }

    // Resolve tenant by subdomain
    const tenant = await cachedResolveTenantBySubdomain(subdomain)
    if (!tenant) {
      return new NextResponse('Tenant not found', { status: 404 })
    }

    return handleTenantRequest(request, tenant)
  }

  // Handle custom domain
  const cleanHostname = hostname.replace(/:\d+$/, '')
  if (cleanHostname &&
      !cleanHostname.includes('localhost') &&
      !cleanHostname.includes('vercel.app')) {
    const tenant = await cachedResolveTenantByDomain(cleanHostname)
    if (tenant) {
      return handleTenantRequest(request, tenant, true)
    }
  }

  // No tenant found - proceed with normal auth
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}