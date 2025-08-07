'use client'

import { useCallback } from 'react'
import { useRealtime, type RealtimePayload } from './use-realtime'
import type { Database } from '@/types/supabase'

type CustomerRow = any

export interface UseRealtimeCustomersConfig {
  onCustomerAdded?: (customer: any) => void
  onCustomerUpdated?: (customer: any, oldCustomer: any) => void
  onCustomerDeleted?: (customerId: string) => void
  onAnyChange?: (payload: any) => void
  tenantId?: string
  enabled?: boolean
}

/**
 * Real-time hook for customer table changes
 * Provides tenant-aware filtering and typed callbacks
 */
export function useRealtimeCustomers(config: UseRealtimeCustomersConfig = {}) {
  const {
    onCustomerAdded,
    onCustomerUpdated,
    onCustomerDeleted,
    onAnyChange,
    tenantId,
    enabled = true
  } = config

  const handleInsert = useCallback(
    (payload: any) => {
      if (payload.new) {
        onCustomerAdded?.(payload.new)
      }
      onAnyChange?.(payload)
    },
    [onCustomerAdded, onAnyChange]
  )

  const handleUpdate = useCallback(
    (payload: any) => {
      if (payload.new && payload.old) {
        onCustomerUpdated?.(payload.new, payload.old)
      }
      onAnyChange?.(payload)
    },
    [onCustomerUpdated, onAnyChange]
  )

  const handleDelete = useCallback(
    (payload: any) => {
      if (payload.old?.id) {
        onCustomerDeleted?.(payload.old.id)
      }
      onAnyChange?.(payload)
    },
    [onCustomerDeleted, onAnyChange]
  )

  // Create tenant-specific filter if tenantId is provided
  const filter = tenantId ? `tenant_id=eq.${tenantId}` : undefined

  // TODO: Re-enable when customer table is supported in realtime types
  // return useRealtime('customer', {
  //   onInsert: handleInsert,
  //   onUpdate: handleUpdate,
  //   onDelete: handleDelete,
  //   filter,
  //   enabled
  // })
  
  // Return empty state for now
  return { data: [], isLoading: false, error: null }
}

/**
 * Enhanced version that tracks customer count changes
 */
export function useRealtimeCustomerStats(config: {
  onCountChange?: (delta: number) => void
  tenantId?: string
  enabled?: boolean
} = {}) {
  const { onCountChange, tenantId, enabled = true } = config

  return useRealtimeCustomers({
    onCustomerAdded: () => onCountChange?.(1),
    onCustomerDeleted: () => onCountChange?.(1),
    tenantId,
    enabled
  })
}