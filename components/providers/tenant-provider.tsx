'use client'

/**
 * Tenant Provider for client-side tenant context
 * Provides tenant information from subdomain/headers throughout the app
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Database } from '@/types/supabase'

type Tenant = Database['public']['Tables']['tenant']['Row']

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  isSubdomain: boolean
  isCustomDomain: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
  initialTenant?: Tenant | null
  isSubdomain?: boolean
  isCustomDomain?: boolean
}

export function TenantProvider({ 
  children, 
  initialTenant = null,
  isSubdomain = false,
  isCustomDomain = false
}: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant)
  const [isLoading, setIsLoading] = useState(!initialTenant)
  
  useEffect(() => {
    // If no initial tenant provided, try to get it from the current page headers
    if (!initialTenant) {
      const getTenantFromHeaders = async () => {
        try {
          // In client-side, we can get tenant info from a dedicated API route
          const response = await fetch('/api/tenant/current')
          if (response.ok) {
            const data = await response.json()
            setTenant(data.tenant)
          }
        } catch (error) {
          console.error('Failed to get tenant from headers:', error)
        } finally {
          setIsLoading(false)
        }
      }
      
      getTenantFromHeaders()
    } else {
      setIsLoading(false)
    }
  }, [initialTenant])

  const value: TenantContextType = {
    tenant,
    isLoading,
    isSubdomain,
    isCustomDomain
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export function useTenantId(): string | null {
  const { tenant } = useTenant()
  return tenant?.id ?? null
}

export function useTenantSubdomain(): string | null {
  const { tenant } = useTenant()
  return tenant?.subdomain ?? null
}

export function useTenantName(): string | null {
  const { tenant } = useTenant()
  return tenant?.name ?? null
}

export function useIsTenantContext(): boolean {
  const { tenant } = useTenant()
  return !!tenant
}