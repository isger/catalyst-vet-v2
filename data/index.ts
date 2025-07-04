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
    cad: string
    fee: string
    net: string
  }
  customer: {
    name: string
    email: string
    address: string
    country: string
    countryFlagUrl: string
  }
  event: {
    name: string
    thumbUrl: string
    url: string
  }
  payment: {
    transactionId: string
    card: {
      type: string
      number: string
      expiry: string
    }
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
      amount: { 
        usd: '$145.00',
        cad: '$195.00',
        fee: '$5.85',
        net: '$189.15'
      },
      customer: { 
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        address: '123 Maple Street, Toronto, ON M5V 2A1',
        country: 'Canada',
        countryFlagUrl: 'https://flagcdn.com/ca.svg'
      },
      event: {
        name: 'Annual Wellness Checkup',
        thumbUrl: '/events/wellness-checkup-thumb.jpg',
        url: '/events/1'
      },
      payment: {
        transactionId: 'txn_1001_abc123',
        card: {
          type: 'Visa',
          number: '4532',
          expiry: '12/26'
        }
      }
    },
    {
      id: '1002',
      date: '2024-01-11',
      url: '/orders/1002',
      amount: { 
        usd: '$89.50',
        cad: '$120.25',
        fee: '$3.61',
        net: '$116.64'
      },
      customer: { 
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        address: '456 Oak Avenue, Vancouver, BC V6J 1M3',
        country: 'Canada',
        countryFlagUrl: 'https://flagcdn.com/ca.svg'
      },
      event: {
        name: 'Vaccination Clinic',
        thumbUrl: '/events/vaccination-thumb.jpg',
        url: '/events/2'
      },
      payment: {
        transactionId: 'txn_1002_def456',
        card: {
          type: 'Mastercard',
          number: '5412',
          expiry: '08/25'
        }
      }
    },
    {
      id: '1003',
      date: '2024-01-10',
      url: '/orders/1003',
      amount: { 
        usd: '$225.00',
        cad: '$302.25',
        fee: '$9.09',
        net: '$293.16'
      },
      customer: { 
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        address: '789 Pine Boulevard, Montreal, QC H3A 1G1',
        country: 'Canada',
        countryFlagUrl: 'https://flagcdn.com/ca.svg'
      },
      event: {
        name: 'Pet Health Seminar',
        thumbUrl: '/events/seminar-thumb.jpg',
        url: '/events/3'
      },
      payment: {
        transactionId: 'txn_1003_ghi789',
        card: {
          type: 'American Express',
          number: '3782',
          expiry: '04/27'
        }
      }
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
    { code: 'US', name: 'United States', flagUrl: 'https://flagcdn.com/us.svg', regions: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California'] },
    { code: 'CA', name: 'Canada', flagUrl: 'https://flagcdn.com/ca.svg', regions: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Ontario'] },
    { code: 'GB', name: 'United Kingdom', flagUrl: 'https://flagcdn.com/gb.svg', regions: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
    { code: 'AU', name: 'Australia', flagUrl: 'https://flagcdn.com/au.svg', regions: ['New South Wales', 'Victoria', 'Queensland', 'South Australia'] },
    { code: 'DE', name: 'Germany', flagUrl: 'https://flagcdn.com/de.svg', regions: ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg'] },
    { code: 'FR', name: 'France', flagUrl: 'https://flagcdn.com/fr.svg', regions: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine'] },
  ]
}