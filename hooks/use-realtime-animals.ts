'use client'

import { useCallback } from 'react'
import { useRealtime, type RealtimePayload } from './use-realtime'
import type { Database } from '@/types/supabase'

type AnimalRow = Database['public']['Tables']['animal']['Row']

export interface UseRealtimeAnimalsConfig {
  onAnimalAdded?: (animal: AnimalRow) => void
  onAnimalUpdated?: (animal: AnimalRow, oldAnimal: AnimalRow) => void
  onAnimalDeleted?: (animalId: string) => void
  onAnyChange?: (payload: RealtimePayload<'animal'>) => void
  ownerId?: string
  tenantId?: string
  enabled?: boolean
}

/**
 * Real-time hook for animal table changes
 * Provides owner and tenant-aware filtering with typed callbacks
 */
export function useRealtimeAnimals(config: UseRealtimeAnimalsConfig = {}) {
  const {
    onAnimalAdded,
    onAnimalUpdated,
    onAnimalDeleted,
    onAnyChange,
    ownerId,
    tenantId,
    enabled = true
  } = config

  const handleInsert = useCallback(
    (payload: RealtimePayload<'animal'>) => {
      if (payload.new) {
        onAnimalAdded?.(payload.new)
      }
      onAnyChange?.(payload)
    },
    [onAnimalAdded, onAnyChange]
  )

  const handleUpdate = useCallback(
    (payload: RealtimePayload<'animal'>) => {
      if (payload.new && payload.old) {
        onAnimalUpdated?.(payload.new, payload.old)
      }
      onAnyChange?.(payload)
    },
    [onAnimalUpdated, onAnyChange]
  )

  const handleDelete = useCallback(
    (payload: RealtimePayload<'animal'>) => {
      if (payload.old?.id) {
        onAnimalDeleted?.(payload.old.id)
      }
      onAnyChange?.(payload)
    },
    [onAnimalDeleted, onAnyChange]
  )

  // Create filters based on provided parameters
  let filter: string | undefined
  if (ownerId && tenantId) {
    filter = `owner_id=eq.${ownerId}.and.tenant_id=eq.${tenantId}`
  } else if (ownerId) {
    filter = `owner_id=eq.${ownerId}`
  } else if (tenantId) {
    filter = `tenant_id=eq.${tenantId}`
  }

  return useRealtime('animal', {
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    filter,
    enabled
  })
}

/**
 * Hook specifically for monitoring animals belonging to a specific owner
 */
export function useRealtimeAnimalsByOwner(
  ownerId: string,
  config: {
    onAnimalAdded?: (animal: AnimalRow) => void
    onAnimalUpdated?: (animal: AnimalRow, oldAnimal: AnimalRow) => void
    onAnimalDeleted?: (animalId: string) => void
    onAnyChange?: (payload: RealtimePayload<'animal'>) => void
    tenantId?: string
    enabled?: boolean
  } = {}
) {
  return useRealtimeAnimals({
    ...config,
    ownerId
  })
}

/**
 * Hook for tracking animal statistics in real-time
 */
export function useRealtimeAnimalStats(config: {
  onCountChange?: (delta: number) => void
  onSpeciesChange?: (species: string, delta: number) => void
  tenantId?: string
  enabled?: boolean
} = {}) {
  const { onCountChange, onSpeciesChange, tenantId, enabled = true } = config

  return useRealtimeAnimals({
    onAnimalAdded: (animal) => {
      onCountChange?.(1)
      if (animal.species) {
        onSpeciesChange?.(animal.species, 1)
      }
    },
    onAnimalDeleted: () => onCountChange?.(-1),
    onAnimalUpdated: (newAnimal, oldAnimal) => {
      // Track species changes
      if (newAnimal.species !== oldAnimal.species) {
        if (oldAnimal.species) {
          onSpeciesChange?.(oldAnimal.species, -1)
        }
        if (newAnimal.species) {
          onSpeciesChange?.(newAnimal.species, 1)
        }
      }
    },
    tenantId,
    enabled
  })
}