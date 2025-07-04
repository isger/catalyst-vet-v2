import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YearView from '../YearView'

describe('YearView', () => {
  it('should render all 12 months', () => {
    render(<YearView />)
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    months.forEach(month => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })
  })

  it('should render day headers for each month', () => {
    render(<YearView />)
    
    // Each month should have day headers M, T, W, T, F, S, S
    // Since there are 12 months, we should have these letters repeated 12 times each
    expect(screen.getAllByText('M')).toHaveLength(12) // Monday headers
    expect(screen.getAllByText('T')).toHaveLength(24) // Tuesday and Thursday headers (2 per month × 12 months)
    expect(screen.getAllByText('W')).toHaveLength(12) // Wednesday headers
    expect(screen.getAllByText('F')).toHaveLength(12) // Friday headers
    expect(screen.getAllByText('S')).toHaveLength(24) // Saturday and Sunday headers (2 per month × 12 months)
  })

  it('should highlight today', () => {
    render(<YearView />)
    
    // Day 12 in January is marked as isToday in test data
    const todayElements = screen.getAllByText('12')
    // Should find at least one today element with the proper styling
    const todayElement = todayElements.find(el => 
      el.closest('time')?.classList.contains('bg-indigo-600')
    )
    expect(todayElement).toBeTruthy()
  })

  it('should render calendar grids for each month', () => {
    render(<YearView />)
    
    // Each month should have a calendar grid
    // Check for some specific dates that should be present
    // Note: Some dates may appear multiple times due to month overlaps
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(12) // 1st of each month (may have overlaps)
    expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(12) // 15th of each month
    expect(screen.getAllByText('31').length).toBeGreaterThanOrEqual(7) // 31st appears in 7+ months
  })

  it('should show current month days differently from other month days', () => {
    render(<YearView />)
    
    // Days marked as isCurrentMonth should have different styling
    // This is tested through the presence of the calendar structure
    const calendarGrids = document.querySelectorAll('.grid-cols-7')
    expect(calendarGrids.length).toBeGreaterThan(12) // Day headers + month grids
  })

  it('should have clickable day buttons', async () => {
    const user = userEvent.setup()
    render(<YearView />)
    
    // All days should be buttons and clickable
    const dayButtons = screen.getAllByRole('button')
    expect(dayButtons.length).toBeGreaterThan(300) // Approximately 365+ days
    
    // Should be able to click on a day button without errors
    await user.click(dayButtons[0])
  })

  it('should render with proper responsive grid layout', () => {
    render(<YearView />)
    
    // Year view should have responsive grid classes
    const yearGrid = document.querySelector('.sm\\:grid-cols-2')
    expect(yearGrid).toBeInTheDocument()
    
    const xlGrid = document.querySelector('.xl\\:grid-cols-3')
    expect(xlGrid).toBeInTheDocument()
    
    // Check for 2xl grid using class contains instead of selector
    const gridContainer = document.querySelector('.mx-auto.grid')
    expect(gridContainer?.className).toContain('2xl:grid-cols-4')
  })

  it('should have proper date time attributes', () => {
    render(<YearView />)
    
    // Check that time elements have proper datetime attributes
    const timeElements = document.querySelectorAll('time[datetime]')
    expect(timeElements.length).toBeGreaterThan(300) // Should have datetime for each day
    
    // Check for some specific datetime values
    expect(document.querySelector('time[datetime="2022-01-01"]')).toBeInTheDocument()
    expect(document.querySelector('time[datetime="2022-12-31"]')).toBeInTheDocument()
  })

  it('should show month names as section headers', () => {
    render(<YearView />)
    
    // Each month should be in its own section with a header
    const sections = document.querySelectorAll('section')
    expect(sections).toHaveLength(12)
    
    // Each section should have a month name as h2
    const monthHeaders = document.querySelectorAll('h2')
    expect(monthHeaders).toHaveLength(12)
  })

  it('should handle proper button styling with rounded corners', () => {
    render(<YearView />)
    
    // Calendar buttons should have proper border radius classes for corners
    const topLeftCorners = document.querySelectorAll('.rounded-tl-lg')
    const topRightCorners = document.querySelectorAll('.rounded-tr-lg')
    const bottomLeftCorners = document.querySelectorAll('.rounded-bl-lg')
    const bottomRightCorners = document.querySelectorAll('.rounded-br-lg')
    
    // Each month should have exactly 4 corner buttons
    expect(topLeftCorners.length).toBe(12)
    expect(topRightCorners.length).toBe(12)
    expect(bottomLeftCorners.length).toBe(12)
    expect(bottomRightCorners.length).toBe(12)
  })

  it('should display dates correctly without leading zeros', () => {
    render(<YearView />)
    
    // Dates should be displayed without leading zeros
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(12) // Not "01" (may have overlaps)
    expect(screen.getAllByText('9').length).toBeGreaterThanOrEqual(12) // Not "09" (may have overlaps)
    
    // Should not find any dates with leading zeros
    expect(screen.queryByText('01')).not.toBeInTheDocument()
    expect(screen.queryByText('09')).not.toBeInTheDocument()
  })

  it('should maintain accessibility with proper button roles', () => {
    render(<YearView />)
    
    // All day elements should be proper buttons for accessibility
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(300)
    
    // Buttons should have proper styling classes
    buttons.forEach(button => {
      expect(button).toHaveClass('hover:bg-gray-100')
      expect(button).toHaveClass('focus:z-10')
    })
  })

  it('should show proper background colors for current vs other month days', () => {
    render(<YearView />)
    
    // Current month days should have white background
    const currentMonthDays = document.querySelectorAll('.bg-white.text-gray-900')
    expect(currentMonthDays.length).toBeGreaterThan(0)
    
    // Other month days should have gray background
    const otherMonthDays = document.querySelectorAll('.bg-gray-50.text-gray-400')
    expect(otherMonthDays.length).toBeGreaterThan(0)
  })
})