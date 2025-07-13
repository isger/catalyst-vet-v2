import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    
    // Get tenant info from headers set by middleware
    const tenantId = headersList.get('x-tenant-id')
    const tenantSubdomain = headersList.get('x-tenant-subdomain')
    const tenantName = headersList.get('x-tenant-name')
    const isCustomDomain = headersList.get('x-tenant-custom-domain') === 'true'
    
    if (!tenantId || !tenantSubdomain || !tenantName) {
      return NextResponse.json({ tenant: null })
    }
    
    const tenant = {
      id: tenantId,
      subdomain: tenantSubdomain,
      name: tenantName,
      // Note: Not including sensitive data like settings, etc.
    }
    
    return NextResponse.json({
      tenant,
      isSubdomain: !isCustomDomain,
      isCustomDomain
    })
  } catch (error) {
    console.error('Error getting current tenant:', error)
    return NextResponse.json({ tenant: null }, { status: 500 })
  }
}