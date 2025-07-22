'use client'

import { useState } from 'react'
import { usePaginatedCustomers } from '@/hooks/use-customers'
import { useAnimals } from '@/hooks/use-animals'
import { useRealtimeCustomerStats, useRealtimeCustomers } from '@/hooks/use-realtime-customers'
import { useRealtimeAnimalStats } from '@/hooks/use-realtime-animals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Example component demonstrating real-time functionality
 * Shows how to use the real-time hooks with your existing data hooks
 */
export function RealtimeExample() {
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [animalCount, setAnimalCount] = useState(0)

  // Regular data hooks with optional real-time
  const { 
    customers, 
    total: totalCustomers, 
    loading: customersLoading 
  } = usePaginatedCustomers({
    page: 1,
    pageSize: 10,
    enableRealtime: realtimeEnabled,
    tenantId: 'your-tenant-id' // Replace with actual tenant ID
  })

  const { 
    animals, 
    totalCount: totalAnimals, 
    loading: animalsLoading 
  } = useAnimals({
    page: 1,
    pageSize: 10,
    enableRealtime: realtimeEnabled,
    tenantId: 'your-tenant-id' // Replace with actual tenant ID
  })

  // Real-time statistics tracking
  useRealtimeCustomerStats({
    onCountChange: (delta) => {
      setCustomerCount(prev => prev + delta)
      addEvent(`Customer count changed: ${delta > 0 ? '+' : ''}${delta}`)
    },
    tenantId: 'your-tenant-id',
    enabled: realtimeEnabled
  })

  useRealtimeAnimalStats({
    onCountChange: (delta) => {
      setAnimalCount(prev => prev + delta)
      addEvent(`Animal count changed: ${delta > 0 ? '+' : ''}${delta}`)
    },
    onSpeciesChange: (species, delta) => {
      addEvent(`${species} count changed: ${delta > 0 ? '+' : ''}${delta}`)
    },
    tenantId: 'your-tenant-id',
    enabled: realtimeEnabled
  })

  // Raw real-time events for demonstration
  useRealtimeCustomers({
    onAnyChange: (payload) => {
      addEvent(`Customer ${payload.eventType}: ${(payload.new as Record<string, unknown>)?.first_name || (payload.old as Record<string, unknown>)?.first_name || 'Unknown'}`)
    },
    tenantId: 'your-tenant-id',
    enabled: realtimeEnabled
  })

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setRealtimeEvents(prev => [`[${timestamp}] ${event}`, ...prev.slice(0, 9)])
  }

  const toggleRealtime = () => {
    setRealtimeEnabled(!realtimeEnabled)
    if (!realtimeEnabled) {
      addEvent('Real-time monitoring enabled')
    } else {
      addEvent('Real-time monitoring disabled')
      setRealtimeEvents([])
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Data Example</h2>
          <p className="text-muted-foreground">
            Demonstrates live updates for customers and animals data
          </p>
        </div>
        <Button 
          onClick={toggleRealtime}
          color={realtimeEnabled ? "red" : "dark/zinc"}
        >
          {realtimeEnabled ? 'Disable' : 'Enable'} Real-time
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Real-time Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Real-time Stats
              {realtimeEnabled && (
                <Badge color="zinc" className="animate-pulse">
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Live statistics tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Customers:</span>
              <span className="font-bold">{totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Animals:</span>
              <span className="font-bold">{totalAnimals}</span>
            </div>
            <div className="flex justify-between">
              <span>Real-time Δ Customers:</span>
              <span className={`font-bold ${customerCount > 0 ? 'text-green-600' : customerCount < 0 ? 'text-red-600' : ''}`}>
                {customerCount > 0 ? '+' : ''}{customerCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Real-time Δ Animals:</span>
              <span className={`font-bold ${animalCount > 0 ? 'text-green-600' : animalCount < 0 ? 'text-red-600' : ''}`}>
                {animalCount > 0 ? '+' : ''}{animalCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Customers
              {realtimeEnabled && (
                <Badge color="zinc" className="animate-pulse">
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Latest customer records {realtimeEnabled && '(auto-updating)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : customers.length > 0 ? (
              <div className="space-y-2">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <Badge color="zinc">
                      {customer.animals?.length || 0} pets
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No customers found</p>
            )}
          </CardContent>
        </Card>

        {/* Real-time Events */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Events</CardTitle>
            <CardDescription>
              Live event stream {!realtimeEnabled && '(disabled)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {realtimeEnabled ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {realtimeEvents.length > 0 ? (
                  realtimeEvents.map((event, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded text-muted-foreground">
                      {event}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No events yet...</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Enable real-time to see events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Animals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Animals
            {realtimeEnabled && (
              <Badge color="zinc" className="animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Latest animal records {realtimeEnabled && '(auto-updating)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {animalsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : animals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.slice(0, 6).map((animal) => (
                <div key={animal.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{animal.name}</h3>
                    <Badge color="zinc">{animal.species}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Owner: {animal.owner ? `${animal.owner.first_name} ${animal.owner.last_name}` : 'Unknown'}
                  </p>
                  {animal.breed && (
                    <p className="text-sm text-muted-foreground">
                      Breed: {animal.breed}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No animals found</p>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Real-time Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Enable Real-time in Existing Hooks</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              {`const { customers } = usePaginatedCustomers({
  page: 1,
  pageSize: 10,
  enableRealtime: true,  // Add this!
  tenantId: "your-tenant-id"
})`}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Use Dedicated Real-time Hooks</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              {`useRealtimeCustomers({
  onCustomerAdded: (customer) => console.log('New customer:', customer),
  onCustomerUpdated: (customer) => console.log('Updated:', customer),
  tenantId: "your-tenant-id"
})`}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Monitor Statistics</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              {`useRealtimeCustomerStats({
  onCountChange: (delta) => updateCounter(delta),
  tenantId: "your-tenant-id"
})`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}