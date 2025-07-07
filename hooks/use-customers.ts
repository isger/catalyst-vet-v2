'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomerWithPets } from '@/server/queries/customers'

export function useActiveCustomers() {
  const [customers, setCustomers] = useState<CustomerWithPets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActiveCustomers() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        // Get owners with their patients and latest appointment info
        const { data, error: supabaseError } = await supabase
          .from('Owner')
          .select(`
            *,
            Patient (
              id,
              name,
              species,
              breed,
              dateOfBirth,
              Appointment (
                scheduledAt,
                status
              )
            )
          `)
          .order('createdAt', { ascending: false })

        if (supabaseError) {
          console.error('Error fetching active customers:', supabaseError)
          setError('Failed to fetch customers')
          return
        }

        if (!data) {
          setCustomers([])
          return
        }

        // Transform the data to match our interface
        const transformedCustomers: CustomerWithPets[] = data.map(owner => {
          // Get the most recent appointment across all pets
          const allAppointments = owner.Patient?.flatMap(patient => 
            patient.Appointment?.filter(apt => apt.status === 'completed') || []
          ) || []
          
          const lastVisit = allAppointments.length > 0 
            ? allAppointments
                .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]
                ?.scheduledAt
            : undefined

          return {
            id: owner.id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
            phone: owner.phone,
            address: owner.address,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
            tenantId: owner.tenantId,
            patients: owner.Patient?.map(patient => ({
              id: patient.id,
              name: patient.name,
              species: patient.species,
              breed: patient.breed,
              dateOfBirth: patient.dateOfBirth
            })) || [],
            lastVisit
          }
        })

        setCustomers(transformedCustomers)
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Failed to fetch customers')
      } finally {
        setLoading(false)
      }
    }

    fetchActiveCustomers()
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