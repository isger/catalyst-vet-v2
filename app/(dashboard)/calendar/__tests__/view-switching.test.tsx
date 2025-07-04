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

describe('Calendar View Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with day view by default', () => {
    render(<Calendar />)
    
    expect(screen.getByText('Day view')).toBeInTheDocument()
    expect(screen.getByText('January 22, 2022')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
  })

  it('should switch to week view when selected', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    // Click the view dropdown
    const viewButton = screen.getByRole('button', { name: /day view/i })
    await user.click(viewButton)
    
    // Click week view option in dropdown menu
    const weekViewOptions = screen.getAllByText('Week view')
    const weekViewOption = weekViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(weekViewOption!)
    
    // Check that view switched
    expect(screen.getByRole('button', { name: /week view/i })).toBeInTheDocument()
    expect(screen.getByText('January 2022')).toBeInTheDocument()
    expect(screen.queryByText('Saturday')).not.toBeInTheDocument()
  })

  it('should show month view', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    const viewButton = screen.getByRole('button', { name: /day view/i })
    await user.click(viewButton)
    
    const monthViewOptions = screen.getAllByText('Month view')
    const monthViewOption = monthViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(monthViewOption!)
    
    expect(screen.getByRole('button', { name: /month view/i })).toBeInTheDocument()
    expect(screen.getByText('January 2022')).toBeInTheDocument()
    // Month view should show calendar grid - check for specific calendar structure
    expect(screen.getByText('M')).toBeInTheDocument()  // Monday header
    expect(screen.getAllByText('T')).toHaveLength(2)  // Tuesday and Thursday headers
    expect(screen.getByText('W')).toBeInTheDocument()  // Wednesday header
    expect(screen.getByText('F')).toBeInTheDocument()  // Friday header
    expect(screen.getAllByText('S')).toHaveLength(2)  // Saturday and Sunday headers
  })

  it('should show year view', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    const viewButton = screen.getByRole('button', { name: /day view/i })
    await user.click(viewButton)
    
    const yearViewOptions = screen.getAllByText('Year view')
    const yearViewOption = yearViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(yearViewOption!)
    
    expect(screen.getByRole('button', { name: /year view/i })).toBeInTheDocument()
    expect(screen.getByText('2022')).toBeInTheDocument()
    // Year view should show all 12 months
    expect(screen.getByText('January')).toBeInTheDocument()
    expect(screen.getByText('February')).toBeInTheDocument()
    expect(screen.getByText('December')).toBeInTheDocument()
  })

  it('should update navigation labels based on current view', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    // Day view navigation
    expect(screen.getByText('Previous day')).toBeInTheDocument()
    expect(screen.getByText('Next day')).toBeInTheDocument()
    
    // Switch to week view
    const viewButton = screen.getByRole('button', { name: /day view/i })
    await user.click(viewButton)
    
    const weekViewOptions = screen.getAllByText('Week view')
    const weekViewOption = weekViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(weekViewOption!)
    
    // Week view navigation
    expect(screen.getByText('Previous week')).toBeInTheDocument()
    expect(screen.getByText('Next week')).toBeInTheDocument()
    
    // Switch to month view
    const weekViewButton = screen.getByRole('button', { name: /week view/i })
    await user.click(weekViewButton)
    
    const monthViewOptions = screen.getAllByText('Month view')
    const monthViewOption = monthViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(monthViewOption!)
    
    // Month view navigation
    expect(screen.getByText('Previous month')).toBeInTheDocument()
    expect(screen.getByText('Next month')).toBeInTheDocument()
    
    // Switch to year view
    const monthViewButton = screen.getByRole('button', { name: /month view/i })
    await user.click(monthViewButton)
    
    const yearViewOptions = screen.getAllByText('Year view')
    const yearViewOption = yearViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(yearViewOption!)
    
    // Year view navigation
    expect(screen.getByText('Previous year')).toBeInTheDocument()
    expect(screen.getByText('Next year')).toBeInTheDocument()
  })

  it('should work with mobile menu', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    // Open mobile menu
    const mobileMenuButton = screen.getByText('Open menu')
    await user.click(mobileMenuButton)
    
    // Click week view in mobile menu (find the one inside the mobile menu)
    const weekViewOptions = screen.getAllByText('Week view')
    const mobileWeekViewOption = weekViewOptions.find(el => {
      const menu = el.closest('[role="menu"]')
      return menu && menu.previousElementSibling?.textContent?.includes('Open menu')
    })
    await user.click(mobileWeekViewOption!)
    
    // Check that view switched
    expect(screen.getByRole('button', { name: /week view/i })).toBeInTheDocument()
  })

  it('should render different events for different views', async () => {
    const user = userEvent.setup()
    render(<Calendar />)
    
    // Day view has specific events
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('Flight to Paris')).toBeInTheDocument()
    expect(screen.getByText('Sightseeing')).toBeInTheDocument()
    
    // Switch to week view
    const viewButton = screen.getByRole('button', { name: /day view/i })
    await user.click(viewButton)
    
    const weekViewOptions = screen.getAllByText('Week view')
    const weekViewOption = weekViewOptions.find(el => el.tagName === 'BUTTON' && el.closest('[role="menu"]'))
    await user.click(weekViewOption!)
    
    // Week view shows events differently (still has same events but positioned for week grid)
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('Flight to Paris')).toBeInTheDocument()
    expect(screen.getByText('Meeting with design team at Disney')).toBeInTheDocument()
  })
})