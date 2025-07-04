import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calendar from '../page'

// Mock useRef to avoid DOM manipulation in tests
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useRef: vi.fn(() => ({ current: null })),
  }
})

describe('Calendar Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render calendar header with date and navigation', () => {
    render(<Calendar />)
    
    expect(screen.getByText('January 22, 2022')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Day view')).toBeInTheDocument()
    expect(screen.getByText('Add event')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(<Calendar />)
    
    const prevButton = screen.getByText('Previous day')
    const nextButton = screen.getByText('Next day')
    
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('should render view dropdown menu', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    const viewButton = screen.getByText('Day view')
    await user.click(viewButton)
    
    expect(screen.getByText('Week view')).toBeInTheDocument()
    expect(screen.getByText('Month view')).toBeInTheDocument()
    expect(screen.getByText('Year view')).toBeInTheDocument()
  })

  it('should render time slots for 24 hours', () => {
    render(<Calendar />)
    
    expect(screen.getByText('12AM')).toBeInTheDocument()
    expect(screen.getByText('1AM')).toBeInTheDocument()
    expect(screen.getByText('6AM')).toBeInTheDocument()
    expect(screen.getByText('12PM')).toBeInTheDocument()
    expect(screen.getByText('6PM')).toBeInTheDocument()
    expect(screen.getByText('11PM')).toBeInTheDocument()
  })

  it('should render sample events', () => {
    render(<Calendar />)
    
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('6:00 AM')).toBeInTheDocument()
    expect(screen.getByText('Flight to Paris')).toBeInTheDocument()
    expect(screen.getByText('7:30 AM')).toBeInTheDocument()
    expect(screen.getByText('Sightseeing')).toBeInTheDocument()
    expect(screen.getByText('11:00 AM')).toBeInTheDocument()
  })

  it('should render mini calendar sidebar', () => {
    render(<Calendar />)
    
    expect(screen.getByText('January 2022')).toBeInTheDocument()
    
    // Days of the week headers - using getAllByText since there are duplicates in mobile/desktop views
    const mondayElements = screen.getAllByText('M')
    const tuesdayElements = screen.getAllByText('T')
    const wednesdayElements = screen.getAllByText('W')
    const fridayElements = screen.getAllByText('F')
    const saturdayElements = screen.getAllByText('S')
    
    expect(mondayElements.length).toBeGreaterThan(0)
    expect(tuesdayElements.length).toBeGreaterThan(0)
    expect(wednesdayElements.length).toBeGreaterThan(0)
    expect(fridayElements.length).toBeGreaterThan(0)
    expect(saturdayElements.length).toBeGreaterThan(0)
  })

  it('should render mobile navigation for small screens', () => {
    render(<Calendar />)
    
    // Mobile day navigation should be present
    const mobileNavButtons = screen.getAllByText('19')
    expect(mobileNavButtons[0]).toBeInTheDocument()
  })

  it('should render mobile menu button', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    const mobileMenuButton = screen.getByText('Open menu')
    expect(mobileMenuButton).toBeInTheDocument()
    
    await user.click(mobileMenuButton)
    
    expect(screen.getByText('Create event')).toBeInTheDocument()
    expect(screen.getByText('Go to today')).toBeInTheDocument()
  })

  it('should have clickable event elements', () => {
    render(<Calendar />)
    
    const breakfastEvent = screen.getByText('Breakfast').closest('a')
    const flightEvent = screen.getByText('Flight to Paris').closest('a')
    const sightseeingEvent = screen.getByText('Sightseeing').closest('a')
    
    expect(breakfastEvent).toHaveAttribute('href', '#')
    expect(flightEvent).toHaveAttribute('href', '#')
    expect(sightseeingEvent).toHaveAttribute('href', '#')
  })

  it('should render calendar grid with proper structure', () => {
    render(<Calendar />)
    
    // Check that events are rendered (which means the grid structure is working)
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('Flight to Paris')).toBeInTheDocument()
    expect(screen.getByText('Sightseeing')).toBeInTheDocument()
  })
})