'use client'

import { useTheme } from 'next-themes'
import { SidebarItem, SidebarLabel } from '@/components/ui/sidebar'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <SidebarItem onClick={toggleTheme}>
      <SidebarLabel suppressHydrationWarning>
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </SidebarLabel>
    </SidebarItem>
  )
}