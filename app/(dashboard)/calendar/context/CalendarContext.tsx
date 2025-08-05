'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppointmentWithDetails, StaffMember, AppointmentFilters } from '@/server/queries/appointments'
import { fetchCalendarAppointments, fetchStaffMembers } from '@/server/actions/calendar'

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month' | 'year'

// Calendar state interface
interface CalendarState {
  // Core state
  currentView: CalendarView
  currentDate: Date
  selectedDate: Date | null
  
  // Data
  appointments: AppointmentWithDetails[]
  staff: StaffMember[]
  
  // Filters and selection
  selectedStaffIds: string[]
  showAllStaff: boolean
  filters: AppointmentFilters
  
  // UI state
  isLoading: boolean
  error: string | null
  isCreatingAppointment: boolean
  selectedAppointment: AppointmentWithDetails | null
  
  // Modal states
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
}

// Action types
type CalendarAction =
  | { type: 'SET_VIEW'; payload: CalendarView }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'SET_APPOINTMENTS'; payload: AppointmentWithDetails[] }
  | { type: 'SET_STAFF'; payload: StaffMember[] }
  | { type: 'SET_SELECTED_STAFF_IDS'; payload: string[] }
  | { type: 'SET_SHOW_ALL_STAFF'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<AppointmentFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CREATING_APPOINTMENT'; payload: boolean }
  | { type: 'SET_SELECTED_APPOINTMENT'; payload: AppointmentWithDetails | null }
  | { type: 'SET_SHOW_CREATE_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_EDIT_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_DELETE_MODAL'; payload: boolean }
  | { type: 'ADD_APPOINTMENT'; payload: AppointmentWithDetails }
  | { type: 'UPDATE_APPOINTMENT'; payload: AppointmentWithDetails }
  | { type: 'REMOVE_APPOINTMENT'; payload: string }
  | { type: 'NAVIGATE_TO_TODAY' }
  | { type: 'NAVIGATE_PREVIOUS' }
  | { type: 'NAVIGATE_NEXT' }

// Initial state
const initialState: CalendarState = {
  currentView: 'week',
  currentDate: new Date(),
  selectedDate: null,
  appointments: [],
  staff: [],
  selectedStaffIds: [],
  showAllStaff: true,
  filters: {},
  isLoading: false,
  error: null,
  isCreatingAppointment: false,
  selectedAppointment: null,
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
}

// Reducer function
function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload }
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload }
    
    case 'SET_STAFF':
      return { ...state, staff: action.payload }
    
    case 'SET_SELECTED_STAFF_IDS':
      return { ...state, selectedStaffIds: action.payload }
    
    case 'SET_SHOW_ALL_STAFF':
      return { ...state, showAllStaff: action.payload }
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_CREATING_APPOINTMENT':
      return { ...state, isCreatingAppointment: action.payload }
    
    case 'SET_SELECTED_APPOINTMENT':
      return { ...state, selectedAppointment: action.payload }
    
    case 'SET_SHOW_CREATE_MODAL':
      return { ...state, showCreateModal: action.payload }
    
    case 'SET_SHOW_EDIT_MODAL':
      return { ...state, showEditModal: action.payload }
    
    case 'SET_SHOW_DELETE_MODAL':
      return { ...state, showDeleteModal: action.payload }
    
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] }
    
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? action.payload : apt
        )
      }
    
    case 'REMOVE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload)
      }
    
    case 'NAVIGATE_TO_TODAY':
      return { ...state, currentDate: new Date() }
    
    case 'NAVIGATE_PREVIOUS': {
      const newDate = new Date(state.currentDate)
      switch (state.currentView) {
        case 'day':
          newDate.setDate(newDate.getDate() - 1)
          break
        case 'week':
          newDate.setDate(newDate.getDate() - 7)
          break
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1)
          break
        case 'year':
          newDate.setFullYear(newDate.getFullYear() - 1)
          break
      }
      return { ...state, currentDate: newDate }
    }
    
    case 'NAVIGATE_NEXT': {
      const newDate = new Date(state.currentDate)
      switch (state.currentView) {
        case 'day':
          newDate.setDate(newDate.getDate() + 1)
          break
        case 'week':
          newDate.setDate(newDate.getDate() + 7)
          break
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1)
          break
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + 1)
          break
      }
      return { ...state, currentDate: newDate }
    }
    
    default:
      return state
  }
}

// Context interface
interface CalendarContextType {
  state: CalendarState
  dispatch: React.Dispatch<CalendarAction>
  
  // Convenience methods
  setView: (view: CalendarView) => void
  setCurrentDate: (date: Date) => void
  setSelectedDate: (date: Date | null) => void
  navigateToToday: () => void
  navigatePrevious: () => void
  navigateNext: () => void
  
  // Staff management
  toggleStaffSelection: (staffId: string) => void
  selectAllStaff: () => void
  deselectAllStaff: () => void
  
  // Appointment management
  openCreateModal: (defaultDate?: Date) => void
  openEditModal: (appointment: AppointmentWithDetails) => void
  openDeleteModal: (appointment: AppointmentWithDetails) => void
  closeModals: () => void
  
  // Data fetching
  refreshData: () => Promise<void>
  
  // Filters
  updateFilters: (filters: Partial<AppointmentFilters>) => void
  
  // Date utilities
  getDateRange: () => { start: Date; end: Date }
  formatDateForView: () => string
}

// Create context
const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

// Provider component
interface CalendarProviderProps {
  children: React.ReactNode
  initialView?: CalendarView
  initialDate?: Date
}

export function CalendarProvider({ 
  children, 
  initialView = 'week',
  initialDate = new Date()
}: CalendarProviderProps) {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    currentView: initialView,
    currentDate: initialDate,
  })

  const supabase = createClient()

  // Convenience methods
  const setView = useCallback((view: CalendarView) => {
    dispatch({ type: 'SET_VIEW', payload: view })
  }, [])

  const setCurrentDate = useCallback((date: Date) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date })
  }, [])

  const setSelectedDate = useCallback((date: Date | null) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }, [])

  const navigateToToday = useCallback(() => {
    dispatch({ type: 'NAVIGATE_TO_TODAY' })
  }, [])

  const navigatePrevious = useCallback(() => {
    dispatch({ type: 'NAVIGATE_PREVIOUS' })
  }, [])

  const navigateNext = useCallback(() => {
    dispatch({ type: 'NAVIGATE_NEXT' })
  }, [])

  // Staff management
  const toggleStaffSelection = useCallback((staffId: string) => {
    const isSelected = state.selectedStaffIds.includes(staffId)
    const newSelection = isSelected
      ? state.selectedStaffIds.filter(id => id !== staffId)
      : [...state.selectedStaffIds, staffId]
    
    dispatch({ type: 'SET_SELECTED_STAFF_IDS', payload: newSelection })
    dispatch({ type: 'SET_SHOW_ALL_STAFF', payload: newSelection.length === 0 })
  }, [state.selectedStaffIds])

  const selectAllStaff = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_STAFF_IDS', payload: state.staff.map(s => s.id) })
    dispatch({ type: 'SET_SHOW_ALL_STAFF', payload: true })
  }, [state.staff])

  const deselectAllStaff = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_STAFF_IDS', payload: [] })
    dispatch({ type: 'SET_SHOW_ALL_STAFF', payload: true })
  }, [])

  // Modal management
  const openCreateModal = useCallback((defaultDate?: Date) => {
    if (defaultDate) {
      dispatch({ type: 'SET_SELECTED_DATE', payload: defaultDate })
    }
    dispatch({ type: 'SET_SHOW_CREATE_MODAL', payload: true })
  }, [])

  const openEditModal = useCallback((appointment: AppointmentWithDetails) => {
    dispatch({ type: 'SET_SELECTED_APPOINTMENT', payload: appointment })
    dispatch({ type: 'SET_SHOW_EDIT_MODAL', payload: true })
  }, [])

  const openDeleteModal = useCallback((appointment: AppointmentWithDetails) => {
    dispatch({ type: 'SET_SELECTED_APPOINTMENT', payload: appointment })
    dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: true })
  }, [])

  const closeModals = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CREATE_MODAL', payload: false })
    dispatch({ type: 'SET_SHOW_EDIT_MODAL', payload: false })
    dispatch({ type: 'SET_SHOW_DELETE_MODAL', payload: false })
    dispatch({ type: 'SET_SELECTED_APPOINTMENT', payload: null })
  }, [])

  // Filter management
  const updateFilters = useCallback((filters: Partial<AppointmentFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }, [])

  // Date utilities
  const getDateRange = useCallback(() => {
    const start = new Date(state.currentDate)
    const end = new Date(state.currentDate)

    switch (state.currentView) {
      case 'day':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        // Start from Monday
        const dayOfWeek = start.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start.setDate(start.getDate() - daysToMonday)
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'month':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(end.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'year':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(11, 31)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }, [state.currentDate, state.currentView])

  const formatDateForView = useCallback(() => {
    const date = state.currentDate

    switch (state.currentView) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'week': {
        const { start, end } = getDateRange()
        if (start.getMonth() === end.getMonth()) {
          return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.getDate()}, ${start.getFullYear()}`
        }
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`
      }
      case 'month':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        })
      case 'year':
        return date.getFullYear().toString()
      default:
        return ''
    }
  }, [state.currentDate, state.currentView, getDateRange])

  // Data fetching
  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Get date range for current view
      const { start, end } = getDateRange()
      
      // Build filters based on current state
      const filters: AppointmentFilters = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        ...state.filters
      }

      // Add staff filtering if not showing all staff
      if (!state.showAllStaff && state.selectedStaffIds.length > 0) {
        filters.staffIds = state.selectedStaffIds
      }

      // Fetch appointments and staff in parallel
      const [appointments, staff] = await Promise.all([
        fetchCalendarAppointments(filters),
        fetchStaffMembers()
      ])

      // Update state with fetched data
      dispatch({ type: 'SET_APPOINTMENTS', payload: appointments })
      dispatch({ type: 'SET_STAFF', payload: staff })

      console.log(`Loaded ${appointments.length} appointments and ${staff.length} staff members`)
    } catch (error) {
      console.error('Failed to refresh calendar data:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load calendar data' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.showAllStaff, state.selectedStaffIds, state.filters, getDateRange])

  // Load data on mount and when dependencies change
  useEffect(() => {
    refreshData()
  }, [state.currentView, state.currentDate, state.showAllStaff, state.selectedStaffIds, refreshData])

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'calendar', table: 'appointment' },
        (payload) => {
          console.log('New appointment:', payload)
          // Trigger a data refresh when new appointments are created
          refreshData()
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'calendar', table: 'appointment' },
        (payload) => {
          console.log('Updated appointment:', payload)
          // Trigger a data refresh when appointments are updated
          refreshData()
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'calendar', table: 'appointment' },
        (payload) => {
          console.log('Deleted appointment:', payload)
          // Trigger a data refresh when appointments are deleted
          refreshData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, refreshData])

  const contextValue: CalendarContextType = {
    state,
    dispatch,
    setView,
    setCurrentDate,
    setSelectedDate,
    navigateToToday,
    navigatePrevious,
    navigateNext,
    toggleStaffSelection,
    selectAllStaff,
    deselectAllStaff,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
    refreshData,
    updateFilters,
    getDateRange,
    formatDateForView,
  }

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  )
}

// Hook to use calendar context
export function useCalendar() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}

// Export types for use in other components
export type { CalendarState, CalendarAction, CalendarContextType }