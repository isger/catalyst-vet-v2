import { Badge } from '@/components/ui/badge'
import { getActiveCustomers } from '@/server/queries/customers'

export async function ActiveCustomers() {
  const customers = await getActiveCustomers()
  
  const formatLastVisit = (lastVisit: string | undefined) => {
    if (!lastVisit) return 'No visits yet'
    
    const date = new Date(lastVisit)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  const formatPets = (patients: any[]) => {
    if (!patients || patients.length === 0) return 'No pets'
    if (patients.length === 1) {
      const pet = patients[0]
      return `${pet.name} (${pet.breed || pet.species})`
    }
    return `${patients.length} pets`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Active Customers</h4>
        <Badge color="green">{customers.length} customers</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">
              {customer.firstName} {customer.lastName}
            </h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatPets(customer.patients)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Last visit: {formatLastVisit(customer.lastVisit)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {customer.email}
            </p>
          </div>
        ))}
      </div>
      {customers.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          No active customers found
        </div>
      )}
    </div>
  )
}

export function NewClients() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">New Clients</h4>
        <Badge color="blue">8 pending</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sample new clients */}
        {[
          { name: 'Alex Rodriguez', pet: 'Bella (Labrador)', inquiry: 'Vaccination schedule' },
          { name: 'Lisa Park', pet: 'Whiskers (Maine Coon)', inquiry: 'Health checkup' },
          { name: 'John Smith', pet: 'Rocky (German Shepherd)', inquiry: 'Training consultation' },
        ].map((client, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">{client.name}</h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{client.pet}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Inquiry: {client.inquiry}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Consultation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Consultation Schedule</h4>
        <Badge color="yellow">5 appointments</Badge>
      </div>
      <div className="space-y-3">
        {/* Sample consultations */}
        {[
          { time: '9:00 AM', customer: 'Sarah Johnson', pet: 'Max', type: 'Routine checkup' },
          { time: '10:30 AM', customer: 'Mike Chen', pet: 'Luna', type: 'Dental cleaning' },
          { time: '2:00 PM', customer: 'Emma Davis', pet: 'Charlie', type: 'Vaccination' },
        ].map((appointment, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div>
              <p className="font-medium text-zinc-950 dark:text-white">{appointment.customer}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{appointment.pet} - {appointment.type}</p>
            </div>
            <Badge color="amber">{appointment.time}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FollowUp() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Follow-up Required</h4>
        <Badge color="orange">12 items</Badge>
      </div>
      <div className="space-y-3">
        {/* Sample follow-ups */}
        {[
          { customer: 'Sarah Johnson', pet: 'Max', action: 'Check vaccination records', priority: 'High' },
          { customer: 'Mike Chen', pet: 'Luna', action: 'Schedule dental follow-up', priority: 'Medium' },
          { customer: 'Emma Davis', pet: 'Charlie', action: 'Review diet plan', priority: 'Low' },
        ].map((item, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-950 dark:text-white">{item.customer}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.pet}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{item.action}</p>
              </div>
              <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'zinc'}>
                {item.priority}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Inactive() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-950 dark:text-white">Inactive Customers</h4>
        <Badge color="zinc">3 customers</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sample inactive customers */}
        {[
          { name: 'Robert Taylor', pet: 'Buddy (Golden Retriever)', lastVisit: '6 months ago' },
          { name: 'Jennifer Lee', pet: 'Mittens (Tabby Cat)', lastVisit: '8 months ago' },
          { name: 'David Wilson', pet: 'Rex (Doberman)', lastVisit: '1 year ago' },
        ].map((customer, index) => (
          <div key={index} className="rounded-lg border border-zinc-200 p-4 opacity-75 dark:border-zinc-700">
            <h5 className="font-medium text-zinc-950 dark:text-white">{customer.name}</h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{customer.pet}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Last visit: {customer.lastVisit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}