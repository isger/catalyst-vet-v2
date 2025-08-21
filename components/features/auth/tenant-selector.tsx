'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { Database } from '@/types/supabase'

type Tenant = Database['public']['Tables']['tenant']['Row']

interface TenantSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  tenants: Tenant[]
  required?: boolean
}

export function TenantSelector({ value, onValueChange, tenants, required }: TenantSelectorProps) {
  return (
    <FormItem>
      <FormLabel>Organization {required && '*'}</FormLabel>
      <Select value={value} onValueChange={onValueChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select an organization" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}