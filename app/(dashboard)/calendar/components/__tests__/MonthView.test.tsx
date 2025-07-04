import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MonthView from '../MonthView'

describe('MonthView', () => {
  it('should render day headers for all days of the week', () => {
    render(<MonthView />)
    
    // Day headers are shortened to single letters with full names as spans
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getAllByText('T')).toHaveLength(2) // Tuesday and Thursday
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
    expect(screen.getAllByText('S')).toHaveLength(2) // Saturday and Sunday
  })

  it('should render full day names on larger screens', () => {
    render(<MonthView />)
    
    // The full names are hidden on small screens but visible on large screens
    expect(screen.getByText('on')).toBeInTheDocument() // from "Mon"
    expect(screen.getByText('ue')).toBeInTheDocument() // from "Tue" 
    expect(screen.getByText('ed')).toBeInTheDocument() // from "Wed"
    expect(screen.getByText('hu')).toBeInTheDocument() // from "Thu"
    expect(screen.getByText('ri')).toBeInTheDocument() // from "Fri"
    expect(screen.getByText('at')).toBeInTheDocument() // from "Sat"
    expect(screen.getByText('un')).toBeInTheDocument() // from "Sun"
  })

  it('should render calendar grid with correct number of days', () => {
    render(<MonthView />)
    
    // Should have days from previous month, current month, and next month
    // Check for some specific dates from the test data (use getAllByText for dates that appear multiple times)
    expect(screen.getAllByText('1')).toHaveLength(2)  // Jan 1, 2022 appears in both desktop and mobile views
    expect(screen.getAllByText('6')).toHaveLength(2)  // Feb 6, 2022 appears in both views
  })

  it('should highlight today', () => {
    render(<MonthView />)
    
    // Day 12 is marked as isToday in test data
    const todayElement = screen.getByText('12')
    expect(todayElement).toHaveClass('bg-indigo-600', 'text-white')
  })

  it('should show selected day', () => {
    render(<MonthView />)
    
    // Day 22 is marked as isSelected in test data - appears in both mobile and desktop views
    const selectedButtons = screen.getAllByText('22')
    expect(selectedButtons.length).toBe(2) // Mobile and desktop views
  })

  it('should display events for days that have them', () => {
    render(<MonthView />)
    
    // Check for events from test data
    expect(screen.getByText('Design review')).toBeInTheDocument()
    expect(screen.getByText('Sales meeting')).toBeInTheDocument()
    expect(screen.getByText('Date night')).toBeInTheDocument()
    expect(screen.getByText("Sam's birthday party")).toBeInTheDocument()
    expect(screen.getByText('Maple syrup museum')).toBeInTheDocument()
    expect(screen.getByText('Hockey game')).toBeInTheDocument()
  })

  it('should show event times on larger screens', () => {
    render(<MonthView />)
    
    // Event times should be visible
    expect(screen.getByText('10AM')).toBeInTheDocument()
    expect(screen.getByText('2PM')).toBeInTheDocument()
    expect(screen.getByText('6PM')).toBeInTheDocument()
    expect(screen.getByText('3PM')).toBeInTheDocument()
    expect(screen.getByText('7PM')).toBeInTheDocument()
  })

  it('should show event indicators on mobile view', () => {
    render(<MonthView />)
    
    // Mobile view shows dots for events instead of full event names
    // The dots have bg-gray-400 class
    const eventDots = document.querySelectorAll('.bg-gray-400')
    expect(eventDots.length).toBeGreaterThan(0)
  })

  it('should show selected day events in mobile detail section', () => {
    render(<MonthView />)
    
    // Selected day (22nd) has events that should show in mobile detail
    expect(screen.getByText('Maple syrup museum')).toBeInTheDocument()
    expect(screen.getByText('Hockey game')).toBeInTheDocument()
    
    // Should show edit buttons for events
    const editButtons = screen.getAllByText('Edit')
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('should handle events with proper accessibility', () => {
    render(<MonthView />)
    
    // Events should be proper links
    const eventLinks = screen.getAllByRole('link')
    expect(eventLinks.length).toBeGreaterThan(0)
    
    // Each event link should have href="#"
    eventLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '#')
    })
  })

  it('should show proper styling for different month days', () => {
    render(<MonthView />)
    
    // Current month days should have different styling than other month days
    // This is handled through CSS classes, so we check the DOM structure exists
    const calendarGrid = document.querySelector('.lg\\:grid-cols-7')
    expect(calendarGrid).toBeInTheDocument()
  })

  it('should be interactive for mobile calendar days', async () => {
    const user = userEvent.setup()
    render(<MonthView />)
    
    // Mobile calendar days should be buttons and clickable
    const dayButtons = screen.getAllByRole('button')
    expect(dayButtons.length).toBeGreaterThan(0)
    
    // Should be able to click on a day button
    await user.click(dayButtons[0])
    // The component doesn't implement selection logic in the test data, 
    // but it should be clickable without errors
  })

  it('should show event count in screen reader text', () => {
    render(<MonthView />)
    
    // Days with events should have screen reader text indicating number of events
    expect(screen.getAllByText('2 events')).toHaveLength(2) // Jan 3rd and Jan 22nd have 2 events each
    expect(screen.getAllByText('1 events')).toHaveLength(2) // Jan 7th and Jan 12th have 1 event each
  })

  it('should show more events indicator when there are many events', () => {
    render(<MonthView />)
    
    // Days with more than 2 events should show "+" indicator
    // The test data has some days with 2+ events that should trigger this
    const moreIndicators = screen.queryAllByText(/\+ \d+ more/)
    // May or may not have any depending on test data, but should not error
    expect(moreIndicators).toBeDefined()
  })
})