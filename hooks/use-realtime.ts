'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type Row<T extends TableName> = Tables[T]['Row']

export interface RealtimeOptions {
  table: TableName
  filter?: string
  schema?: string
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimePayload<T extends TableName> {
  eventType: RealtimeEventType
  new: Row<T> | null
  old: Row<T> | null
  errors: string[] | null
}

export interface UseRealtimeConfig<T extends TableName> {
  onInsert?: (payload: RealtimePayload<T>) => void
  onUpdate?: (payload: RealtimePayload<T>) => void
  onDelete?: (payload: RealtimePayload<T>) => void
  onChange?: (payload: RealtimePayload<T>) => void
  filter?: string
  enabled?: boolean
}

/**
 * Generic real-time hook for Supabase tables
 * Automatically handles subscription lifecycle and cleanup
 */
export function useRealtime<T extends TableName>(
  table: T,
  config: UseRealtimeConfig<T> = {}
) {
  const {
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    filter,
    enabled = true
  } = config

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const handlePostgresChanges = useCallback(
    (payload: RealtimePostgresChangesPayload<Row<T>>) => {
      const realtimePayload: RealtimePayload<T> = {
        eventType: payload.eventType as RealtimeEventType,
        new: payload.new as Row<T> | null,
        old: payload.old as Row<T> | null,
        errors: payload.errors || null
      }

      // Call the general onChange handler
      onChange?.(realtimePayload)

      // Call specific event handlers
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(realtimePayload)
          break
        case 'UPDATE':
          onUpdate?.(realtimePayload)
          break
        case 'DELETE':
          onDelete?.(realtimePayload)
          break
      }
    },
    [onChange, onInsert, onUpdate, onDelete]
  )

  const subscribe = useCallback(() => {
    if (!enabled) return

    const channelName = `realtime:${table}${filter ? `:${filter}` : ''}`
    const channel = supabase.channel(channelName)

    // Configure postgres changes listener
    const postgresConfig: any = {
      event: '*' as const,
      schema: 'public',
      table: table as string
    }

    if (filter) {
      postgresConfig.filter = filter
    }

    channel.on('postgres_changes', postgresConfig, handlePostgresChanges)

    // Subscribe and store reference
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to real-time updates for table: ${table}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Error subscribing to real-time updates for table: ${table}`)
      }
    })

    channelRef.current = channel
  }, [enabled, table, filter, handlePostgresChanges, supabase])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      console.log(`🔌 Unsubscribed from real-time updates for table: ${table}`)
    }
  }, [supabase, table])

  // Set up subscription
  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [subscribe, unsubscribe])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe()
    }
  }, [unsubscribe])

  return {
    subscribe,
    unsubscribe,
    isSubscribed: !!channelRef.current
  }
}

/**
 * Hook for listening to multiple tables at once
 */
export function useMultiTableRealtime(
  subscriptions: Array<{
    table: TableName
    config: UseRealtimeConfig<any>
  }>
) {
  const activeSubscriptions = subscriptions.map(({ table, config }) => 
    useRealtime(table, config)
  )

  const subscribeAll = useCallback(() => {
    activeSubscriptions.forEach(sub => sub.subscribe())
  }, [activeSubscriptions])

  const unsubscribeAll = useCallback(() => {
    activeSubscriptions.forEach(sub => sub.unsubscribe())
  }, [activeSubscriptions])

  return {
    subscribeAll,
    unsubscribeAll,
    subscriptions: activeSubscriptions
  }
}