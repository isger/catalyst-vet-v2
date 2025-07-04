import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/ui/dropdown'
import { Heading } from '@/components/ui/heading'
import { Link } from '@/components/ui/link'
import { getEvents } from '@/data'
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
}

export default async function Events() {
  let events = await getEvents()

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Events</Heading>
        </div>
        <Button>Create event</Button>
      </div>
      <ul className="mt-10">
        {events.map((event, index) => (
          <li key={event.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div key={event.id} className="flex gap-6 py-6">
                <div className="w-32 shrink-0">
                  <Link href={event.url} aria-hidden="true">
                    <img className="aspect-3/2 rounded-lg shadow-sm" src={event.imgUrl} alt="" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <Link href={event.url}>{event.name}</Link>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
                    {event.date} at {event.time} <span aria-hidden="true">·</span> {event.location}
                  </div>
                  <div className="text-xs/6 text-zinc-600">
                    {event.ticketsSold}/{event.ticketsAvailable} tickets sold
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="max-sm:hidden" color={event.status === 'On Sale' ? 'lime' : 'zinc'}>
                  {event.status}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={event.url}>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
