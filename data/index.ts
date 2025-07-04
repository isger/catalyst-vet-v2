// Mock data utilities - replace with actual API calls in production

export type Event = {
  id: string
  name: string
  date: string
  time: string
  location: string
  url: string
  imgUrl: string
  thumbUrl: string
  status: 'On Sale' | 'Sold Out' | 'Cancelled'
  ticketsSold: number
  ticketsAvailable: number
}

export type Order = {
  id: string
  date: string
  url: string
  amount: {
    usd: string
  }
  customer: {
    name: string
  }
  event: {
    name: string
    thumbUrl: string
  }
}

export async function getEvents(): Promise<Event[]> {
  // Mock events data
  return [
    {
      id: '1',
      name: 'Annual Wellness Checkup',
      date: '2024-01-15',
      time: '09:00 AM',
      location: 'Main Office',
      url: '/events/1',
      imgUrl: '/events/wellness-checkup.jpg',
      thumbUrl: '/events/wellness-checkup-thumb.jpg',
      status: 'On Sale',
      ticketsSold: 45,
      ticketsAvailable: 60,
    },
    {
      id: '2',
      name: 'Vaccination Clinic',
      date: '2024-01-20',
      time: '10:00 AM',
      location: 'Community Center',
      url: '/events/2',
      imgUrl: '/events/vaccination.jpg',
      thumbUrl: '/events/vaccination-thumb.jpg',
      status: 'On Sale',
      ticketsSold: 30,
      ticketsAvailable: 50,
    },
    {
      id: '3',
      name: 'Pet Health Seminar',
      date: '2024-01-25',
      time: '02:00 PM',
      location: 'Conference Room',
      url: '/events/3',
      imgUrl: '/events/seminar.jpg',
      thumbUrl: '/events/seminar-thumb.jpg',
      status: 'Sold Out',
      ticketsSold: 100,
      ticketsAvailable: 100,
    },
  ]
}

export async function getRecentOrders(): Promise<Order[]> {
  // Mock orders data
  return [
    {
      id: '1001',
      date: '2024-01-12',
      url: '/orders/1001',
      amount: { usd: '$145.00' },
      customer: { name: 'Sarah Johnson' },
      event: {
        name: 'Annual Wellness Checkup',
        thumbUrl: '/events/wellness-checkup-thumb.jpg',
      },
    },
    {
      id: '1002',
      date: '2024-01-11',
      url: '/orders/1002',
      amount: { usd: '$89.50' },
      customer: { name: 'Mike Chen' },
      event: {
        name: 'Vaccination Clinic',
        thumbUrl: '/events/vaccination-thumb.jpg',
      },
    },
    {
      id: '1003',
      date: '2024-01-10',
      url: '/orders/1003',
      amount: { usd: '$225.00' },
      customer: { name: 'Emily Rodriguez' },
      event: {
        name: 'Pet Health Seminar',
        thumbUrl: '/events/seminar-thumb.jpg',
      },
    },
  ]
}

export async function getEvent(id: string): Promise<Event & {
  totalRevenue: string
  totalRevenueChange: string
  ticketsSoldChange: string
  pageViews: string
  pageViewsChange: string
} | null> {
  const events = await getEvents()
  const event = events.find(e => e.id === id)
  
  if (!event) return null
  
  return {
    ...event,
    totalRevenue: '$12,345',
    totalRevenueChange: '+8.2%',
    ticketsSoldChange: '+12%',
    pageViews: '2,847',
    pageViewsChange: '+15.3%'
  }
}

export async function getEventOrders(eventId: string): Promise<Order[]> {
  const orders = await getRecentOrders()
  return orders.filter(order => order.event.name.includes('Wellness') || order.event.name.includes('Vaccination'))
}

export async function getOrders(): Promise<Order[]> {
  // Return all orders for the orders page
  return getRecentOrders()
}

export async function getOrder(id: string): Promise<Order & {
  refunds?: Array<{ id: string; amount: string; date: string; status: string }>
} | null> {
  const orders = await getOrders()
  const order = orders.find(o => o.id === id)
  
  if (!order) return null
  
  return {
    ...order,
    refunds: []
  }
}

export function getCountries() {
  return [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
  ]
}