'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithPets, PaginationParams, PaginatedResult } from '@/server/queries/customers'
import { fetchPaginatedCustomers } from '@/server/actions/customers'

export function usePaginatedCustomers(params: PaginationParams) {
  const [data, setData] = useState<PaginatedResult<CustomerWithPets>>({
    data: [],
    total: 0,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async (fetchParams: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchPaginatedCustomers(fetchParams)
      setData(result)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(params)
  }, [fetchCustomers, params.page, params.pageSize, params.search, params.sortBy, params.sortOrder])

  const refetch = useCallback(() => {
    fetchCustomers(params)
  }, [fetchCustomers, params])

  return { 
    customers: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    loading, 
    error,
    refetch
  }
}

// Legacy hook for backward compatibility - will be deprecated
export function useActiveCustomers() {
  const [customers, setCustomers] = useState<CustomerWithPets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAllCustomers() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all customers (up to 1000) for backward compatibility
        const result = await fetchPaginatedCustomers({ page: 1, pageSize: 1000 })
        setCustomers(result.data)
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Failed to fetch customers')
      } finally {
        setLoading(false)
      }
    }

    fetchAllCustomers()
  }, [])

  return { customers, loading, error }
}

export function useCustomerStats() {
  const [stats, setStats] = useState({
    active: 0,
    new: 0,
    consultation: 0,
    followUp: 0,
    inactive: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        const { data: owners, error: supabaseError } = await supabase
          .from('Owner')
          .select(`
            id,
            createdAt,
            Patient (
              Appointment (
                status,
                scheduledAt
              )
            )
          `)

        if (supabaseError) {
          console.error('Error fetching customer stats:', supabaseError)
          setError('Failed to fetch stats')
          return
        }

        if (!owners) {
          setStats({ active: 0, new: 0, consultation: 0, followUp: 0, inactive: 0 })
          return
        }

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

        let active = 0
        let newClients = 0
        let consultation = 0
        let inactive = 0

        owners.forEach(owner => {
          const createdDate = new Date(owner.createdAt)
          
          // Get all appointments from all patients
          const allAppointments = owner.Patient?.flatMap(patient => 
            patient.Appointment || []
          ) || []
          
          const hasRecentAppointment = allAppointments.some(apt => 
            new Date(apt.scheduledAt) > thirtyDaysAgo
          )
          const hasUpcomingAppointment = allAppointments.some(apt => 
            apt.status === 'scheduled' && new Date(apt.scheduledAt) > now
          )

          // New clients (created in last 30 days)
          if (createdDate > thirtyDaysAgo) {
            newClients++
          }
          
          // Consultation (has upcoming appointments)
          if (hasUpcomingAppointment) {
            consultation++
          }
          
          // Active (has recent activity)
          if (hasRecentAppointment || hasUpcomingAppointment) {
            active++
          }
          
          // Inactive (no activity in 6+ months)
          if (!hasRecentAppointment && createdDate < sixMonthsAgo) {
            inactive++
          }
        })

        setStats({ 
          active, 
          new: newClients, 
          consultation, 
          followUp: 0, // We'll implement this later based on appointment follow-up logic
          inactive 
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}