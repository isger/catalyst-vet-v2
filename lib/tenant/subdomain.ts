/**
 * Subdomain extraction utilities for multi-tenant routing
 * Based on Vercel Platforms pattern
 */

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'localhost:3000'

/**
 * Extract subdomain from hostname
 */
export function getSubdomain(hostname: string): string | null {
  // Remove protocol if present
  const cleanHostname = hostname.replace(/^https?:\/\//, '')
  
  // Handle localhost development
  if (cleanHostname.includes('localhost')) {
    const parts = cleanHostname.split('.')
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0]
    }
    return null
  }
  
  // Production domain handling
  const rootDomain = ROOT_DOMAIN.replace(/^https?:\/\//, '')
  
  if (cleanHostname === rootDomain || cleanHostname === `www.${rootDomain}`) {
    return null
  }
  
  // Extract subdomain
  const subdomainRegex = new RegExp(`^(.+)\\.${rootDomain.replace('.', '\\.')}$`)
  const match = cleanHostname.match(subdomainRegex)
  
  if (match && match[1] && match[1] !== 'www') {
    return match[1]
  }
  
  return null
}

/**
 * Check if hostname has a subdomain
 */
export function hasSubdomain(hostname: string): boolean {
  return getSubdomain(hostname) !== null
}

/**
 * Get tenant-specific URL for a given subdomain and path
 */
export function getTenantUrl(subdomain: string, path: string = '/'): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const rootDomain = ROOT_DOMAIN.replace(/^https?:\/\//, '')
  
  if (process.env.NODE_ENV === 'development') {
    return `${protocol}://${subdomain}.${rootDomain}${path}`
  }
  
  return `${protocol}://${subdomain}.${rootDomain}${path}`
}

/**
 * Check if subdomain is valid (basic validation)
 */
export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || subdomain.length === 0) return false
  
  // Basic subdomain validation
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  return subdomainRegex.test(subdomain) && subdomain.length <= 63
}

/**
 * Extract subdomain from Next.js request
 */
export function getSubdomainFromRequest(url: string, host?: string): string | null {
  if (!host) return null
  
  return getSubdomain(host)
}

/**
 * Reserved subdomains that cannot be used for tenants
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'support',
  'help',
  'docs',
  'blog',
  'mail',
  'ftp',
  'staging',
  'dev',
  'test',
  'demo',
  'status',
  'cdn',
  'assets',
  'static',
  'media',
  'files'
] as const

/**
 * Check if subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain as any)
}