'use client'

import { useCallback } from 'react'
import { useRealtime, type RealtimePayload } from './use-realtime'
import type { Database } from '@/types/supabase'

type CustomerRow = Database['public']['Tables']['customer']['Row']

export interface UseRealtimeCustomersConfig {
  onCustomerAdded?: (customer: CustomerRow) => void
  onCustomerUpdated?: (customer: CustomerRow, oldCustomer: CustomerRow) => void
  onCustomerDeleted?: (customerId: string) => void
  onAnyChange?: (payload: RealtimePayload<'customer'>) => void
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
    (payload: RealtimePayload<'customer'>) => {
      if (payload.new) {
        onCustomerAdded?.(payload.new)
      }
      onAnyChange?.(payload)
    },
    [onCustomerAdded, onAnyChange]
  )

  const handleUpdate = useCallback(
    (payload: RealtimePayload<'customer'>) => {
      if (payload.new && payload.old) {
        onCustomerUpdated?.(payload.new, payload.old)
      }
      onAnyChange?.(payload)
    },
    [onCustomerUpdated, onAnyChange]
  )

  const handleDelete = useCallback(
    (payload: RealtimePayload<'customer'>) => {
      if (payload.old?.id) {
        onCustomerDeleted?.(payload.old.id)
      }
      onAnyChange?.(payload)
    },
    [onCustomerDeleted, onAnyChange]
  )

  // Create tenant-specific filter if tenantId is provided
  const filter = tenantId ? `tenant_id=eq.${tenantId}` : undefined

  return useRealtime('customer', {
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    filter,
    enabled
  })
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