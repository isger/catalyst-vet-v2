import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getSubdomainFromRequest, isReservedSubdomain } from '@/lib/tenant/subdomain';
import { cachedResolveTenantBySubdomain, cachedResolveTenantByDomain } from '@/lib/tenant/cache';

type Tenant = {
  id: string;
  subdomain: string;
  name: string;
};

/**
 * Attaches tenant-specific headers to a NextResponse.
 * @param response The NextResponse object to modify.
 * @param tenant The tenant data.
 * @param isCustomDomain A flag indicating if the request is from a custom domain.
 */
function addTenantHeaders(response: NextResponse, tenant: Tenant, isCustomDomain = false): void {
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-tenant-subdomain', tenant.subdomain);
  response.headers.set('x-tenant-name', tenant.name);
  if (isCustomDomain) {
    response.headers.set('x-tenant-custom-domain', 'true');
  }
}

/**
 * The main middleware function to handle requests.
 * It resolves tenants based on subdomains or custom domains and runs authentication.
 * @param request The incoming NextRequest.
 * @returns A NextResponse object.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const hostname = request.headers.get('host');

  // Ensure a hostname is present.
  if (!hostname) {
    // A hostname is crucial for tenant resolution.
    // If it's missing, return a Bad Request response.
    return new NextResponse('Hostname not found', { status: 400 });
  }

  let tenant: Tenant | null = null;
  let isCustomDomain = false;

  // Resolve tenant based on subdomain or custom domain.
  const subdomain = getSubdomainFromRequest(request.url, hostname);

  if (subdomain) {
    // Handle subdomain-based tenant resolution.
    if (isReservedSubdomain(subdomain)) {
      return new NextResponse('Reserved subdomain', { status: 404 });
    }
    const resolvedTenant = await cachedResolveTenantBySubdomain(subdomain);
    if (resolvedTenant) {
      tenant = {
        id: resolvedTenant.id,
        subdomain: resolvedTenant.subdomain || '',
        name: resolvedTenant.name,
      };
    }
  } else {
    // Handle custom domain-based tenant resolution.
    const cleanHostname = hostname.replace(/:\d+$/, ''); // Remove port number
    if (!cleanHostname.includes('localhost') && !cleanHostname.includes('vercel.app')) {
      const resolvedTenant = await cachedResolveTenantByDomain(cleanHostname);
      if (resolvedTenant) {
        tenant = {
          id: resolvedTenant.id,
          subdomain: resolvedTenant.subdomain || '',
          name: resolvedTenant.name,
        };
        isCustomDomain = true;
      }
    }
  }

  // If no tenant is found, proceed with the default session update.
  if (!tenant) {
    // This handles the case for the main app domain without a specific tenant.
    return await updateSession(request);
  }

  // If a tenant is found, create a new request with tenant headers for the auth middleware.
  const requestWithTenantHeaders = new NextRequest(request.url, {
    headers: request.headers,
  });
  addTenantHeaders(requestWithTenantHeaders, tenant, isCustomDomain);

  // Run the authentication middleware.
  const response = await updateSession(requestWithTenantHeaders);

  // Ensure the final response also contains the tenant headers.
  addTenantHeaders(response, tenant, isCustomDomain);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - anything with a file extension
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};