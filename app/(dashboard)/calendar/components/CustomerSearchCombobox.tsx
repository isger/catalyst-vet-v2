'use client'

import { useState, useEffect } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { UserIcon } from '@heroicons/react/24/outline'
// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return debounced
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  animals: Array<{
    id: string
    name: string
    species: string
    breed: string | null
  }>
}

interface CustomerSearchComboboxProps {
  value: string
  onChange: (customerId: string) => void
  onCustomerSelect?: (customer: Customer | null) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

// Server action to search customers
async function searchCustomers(query: string, initial: boolean = false): Promise<Customer[]> {
  try {
    const response = await fetch('/api/customers/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: initial ? '' : query, 
        limit: initial ? 10 : 20,
        initial 
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to search customers')
    }
    
    const data = await response.json()
    return data.customers || []
  } catch (error) {
    console.error('Error searching customers:', error)
    return []
  }
}

export default function CustomerSearchCombobox({
  value,
  onChange,
  onCustomerSelect,
  placeholder = 'Search customers...',
  label = 'Customer',
  error,
  disabled = false
}: CustomerSearchComboboxProps) {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Function to load initial customers
  const loadInitialCustomers = async () => {
    setIsLoading(true)
    try {
      const results = await searchCustomers('', true)
      setCustomers(results)
    } catch (error) {
      console.error('Error loading initial customers:', error)
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      // If query is too short, show initial customers
      await loadInitialCustomers()
      return
    }

    setIsLoading(true)
    try {
      const results = await searchCustomers(searchQuery)
      setCustomers(results)
    } catch (error) {
      console.error('Search error:', error)
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Load initial customers on mount
  useEffect(() => {
    loadInitialCustomers()
  }, [])

  // Effect to trigger search when query changes
  useEffect(() => {
    if (query === '') {
      // If query is cleared, show initial customers
      loadInitialCustomers()
    } else {
      debouncedSearch(query)
    }
    
    // Cleanup
    return () => {
      debouncedSearch.cancel()
    }
  }, [query])

  // Find customer by ID when value changes
  useEffect(() => {
    if (value && !selectedCustomer) {
      // If we have a value but no selected customer, try to find it in the current results
      const customer = customers.find(c => c.id === value)
      if (customer) {
        setSelectedCustomer(customer)
      }
    } else if (!value) {
      setSelectedCustomer(null)
    }
  }, [value, customers, selectedCustomer])

  const handleSelectionChange = (customer: Customer | null) => {
    setSelectedCustomer(customer)
    onChange(customer?.id || '')
    onCustomerSelect?.(customer)
    setQuery('')
  }

  const displayValue = (customer: Customer | null) => {
    if (!customer) return ''
    return `${customer.first_name} ${customer.last_name}`
  }

  // Show customers based on query state
  const displayCustomers = query === '' ? customers : customers

  return (
    <div>
      <Combobox
        as="div"
        value={selectedCustomer}
        onChange={handleSelectionChange}
        disabled={disabled}
      >
        <Label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
          {label}
        </Label>
        <div className="relative mt-2">
          <ComboboxInput
            className={`block w-full rounded-md bg-white dark:bg-gray-800 py-1.5 pr-12 pl-10 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
              error ? 'outline-red-500 focus:outline-red-500' : ''
            }`}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              // Don't clear query on blur to show the search term
              if (!selectedCustomer) {
                setTimeout(() => setQuery(''), 100)
              }
            }}
            displayValue={displayValue}
            placeholder={placeholder}
          />
          
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="size-5 text-gray-400" aria-hidden="true" />
          </div>

          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
            <ChevronDownIcon className="size-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          <ComboboxOptions
            transition
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
          >
            {isLoading && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            )}
            
            {!isLoading && query.length > 0 && displayCustomers.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No customers found for "{query}"
              </div>
            )}

            {!isLoading && query.length > 0 && query.length < 2 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                Type at least 2 characters to search
              </div>
            )}

            {!isLoading && query.length === 0 && displayCustomers.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No customers found
              </div>
            )}

            {displayCustomers.map((customer) => (
              <ComboboxOption
                key={customer.id}
                value={customer}
                className="cursor-default px-3 py-2 text-gray-900 dark:text-gray-100 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <div className="flex items-center">
                  <UserIcon className="size-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="block truncate font-medium">
                        {customer.first_name} {customer.last_name}
                      </span>
                      {customer.animals.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500 data-focus:text-white/80">
                          {customer.animals.length} pet{customer.animals.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 data-focus:text-white/80">
                      <span className="truncate">{customer.email}</span>
                      {customer.phone && (
                        <span className="truncate">{customer.phone}</span>
                      )}
                    </div>
                    {customer.animals.length > 0 && (
                      <div className="mt-1 text-xs text-gray-400 data-focus:text-white/60">
                        Pets: {customer.animals.map(a => `${a.name} (${a.species})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}