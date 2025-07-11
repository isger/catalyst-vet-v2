'use client'

import { Avatar } from '@/components/ui/avatar'
import { signOut } from '@/server/actions/auth'
import type { User } from '@supabase/supabase-js'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/ui/sidebar'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { getEvents } from '@/data'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  CalendarIcon,
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  HeartIcon,
  BanknotesIcon
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const handleSignOut = async () => {
    await signOut()
  }
  
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={handleSignOut}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

type tenant = {
  id: string
  name: string
  logo: string | null
}

type membership = {
  id: string
  user_id: string
  tenant_id: string
  role: 'owner' | 'admin' | 'member'
}

export function ApplicationLayout({
  events,
  user,
  tenant,
  membership,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  user: User
  tenant: tenant
  membership: membership
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get user display information
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || 'user@example.com'
  const userAvatar = user?.user_metadata?.avatar_url
  
  // Get tenant display information
  const tenantName = tenant?.name || 'Catalyst Veterinary'
  const tenantLogo = tenant?.logo

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar 
                  src={userAvatar || "/users/default-avatar.jpg"} 
                  initials={!userAvatar ? userName.charAt(0).toUpperCase() : undefined}
                  square={true}
                />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar 
                  src={tenantLogo || "/teams/catalyst.svg"} 
                  initials={!tenantLogo ? tenantName.charAt(0).toUpperCase() : undefined}
                  square={true}
                />
                <SidebarLabel>{tenantName}</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <Avatar 
                    slot="icon" 
                    src={tenantLogo || "/teams/catalyst.svg"} 
                    initials={!tenantLogo ? tenantName.charAt(0).toUpperCase() : undefined}
                    square={true}
                  />
                  <DropdownLabel>{tenantName}</DropdownLabel>
                </DropdownItem>
                {membership?.role === 'owner' && (
                  <>
                    <DropdownDivider />
                    <DropdownItem href="#">
                      <PlusIcon />
                      <DropdownLabel>Invite users&hellip;</DropdownLabel>
                    </DropdownItem>
                  </>
                )}
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/dashboard" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/customers" current={pathname.startsWith('/customers')}>
                <UserCircleIcon />
                <SidebarLabel>Customers</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/orders" current={pathname.startsWith('/orders')}>
                <HeartIcon />
                <SidebarLabel>Animals</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/events" current={pathname.startsWith('/events')}>
                <Square2StackIcon />
                <SidebarLabel>Events</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/calendar" current={pathname.startsWith('/calendar')}>
                <CalendarIcon />
                <SidebarLabel>Calendar</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <BanknotesIcon />
                <SidebarLabel>Financial</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Upcoming Events</SidebarHeading>
              {events.map((event) => (
                <SidebarItem key={event.id} href={event.url}>
                  {event.name}
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <ThemeToggle />
              <SidebarItem href="#">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar 
                    src={userAvatar || "/users/default-avatar.jpg"} 
                    initials={!userAvatar ? userName.charAt(0).toUpperCase() : undefined}
                    className="size-10" 
                    square 
                    alt="" 
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {userName}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {userEmail}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
