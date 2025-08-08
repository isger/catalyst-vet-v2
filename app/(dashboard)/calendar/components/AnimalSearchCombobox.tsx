'use client'

import { useState, useEffect, useCallback } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { HeartIcon } from '@heroicons/react/24/outline'

// Simple debounce utility
function debounce<T extends (...args: never[]) => unknown>(func: T, wait: number) {
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

interface Animal {
  id: string
  name: string
  species: string
  breed: string | null
  date_of_birth: string | null
  owner: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | null
}

interface AnimalSearchComboboxProps {
  value: string
  onChange: (animalId: string) => void
  onAnimalSelect?: (animal: Animal | null) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  ownerId?: string // Filter animals by owner
}

// Server action to search animals
async function searchAnimals(query: string, initial: boolean = false, ownerId?: string): Promise<Animal[]> {
  try {
    console.log('=== Animal Search Debug ===')
    console.log('Query:', query)
    console.log('Initial:', initial)
    console.log('Owner ID:', ownerId)
    
    const response = await fetch('/api/animals/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: initial ? '' : query, 
        limit: initial ? 10 : 20,
        initial,
        ownerId
      }),
    })
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`Failed to search animals: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('API Response data:', data)
    console.log('==========================')
    
    return data.animals || []
  } catch (error) {
    console.error('Error searching animals:', error)
    return []
  }
}

export default function AnimalSearchCombobox({
  value,
  onChange,
  onAnimalSelect,
  placeholder = 'Search animals...',
  label = 'Animal',
  error,
  disabled = false,
  ownerId
}: AnimalSearchComboboxProps) {
  const [query, setQuery] = useState('')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)

  // Function to load animals (either initial or by owner)
  const loadAnimals = useCallback(async (searchQuery: string = '', isInitial: boolean = false) => {
    setIsLoading(true)
    try {
      const results = await searchAnimals(searchQuery, isInitial, ownerId)
      setAnimals(results)
    } catch (error) {
      console.error('Error loading animals:', error)
      setAnimals([])
    } finally {
      setIsLoading(false)
    }
  }, [ownerId])

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!ownerId && searchQuery.length < 2) {
      // If no owner filter and query too short, show initial animals
      await loadAnimals('', true)
      return
    }

    await loadAnimals(searchQuery, false)
  }, 300)

  // Load animals when component mounts or ownerId changes
  useEffect(() => {
    if (ownerId) {
      // If we have an owner ID, load their animals
      loadAnimals('', false)
    } else {
      // Otherwise load initial animals
      loadAnimals('', true)
    }
    
    // Clear selection when owner changes
    setSelectedAnimal(null)
    onChange('')
  }, [ownerId, onChange, loadAnimals])

  // Effect to trigger search when query changes
  useEffect(() => {
    if (query === '') {
      // If query is cleared, load appropriate animals
      if (ownerId) {
        loadAnimals('', false)
      } else {
        loadAnimals('', true)
      }
    } else {
      debouncedSearch(query)
    }
    
    // Cleanup
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, ownerId, debouncedSearch, loadAnimals])

  // Find animal by ID when value changes
  useEffect(() => {
    if (value && !selectedAnimal) {
      // If we have a value but no selected animal, try to find it in the current results
      const animal = animals.find(a => a.id === value)
      if (animal) {
        setSelectedAnimal(animal)
      }
    } else if (!value) {
      setSelectedAnimal(null)
    }
  }, [value, animals, selectedAnimal])

  const handleSelectionChange = (animal: Animal | null) => {
    setSelectedAnimal(animal)
    onChange(animal?.id || '')
    onAnimalSelect?.(animal)
    setQuery('')
  }

  const displayValue = (animal: Animal | null) => {
    if (!animal) return ''
    return `${animal.name} (${animal.species})`
  }

  // Calculate age if date of birth is available
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null
    
    const birth = new Date(dateOfBirth)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    
    if (ageInMonths < 12) {
      return `${ageInMonths} mo`
    } else {
      const years = Math.floor(ageInMonths / 12)
      return `${years} yr`
    }
  }

  // Show animals based on query state
  const displayAnimals = animals

  return (
    <div>
      <Combobox
        as="div"
        value={selectedAnimal}
        onChange={handleSelectionChange}
        disabled={disabled}
      >
        <Label className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
          {label}
        </Label>
        <div className="relative mt-2">
          <ComboboxInput
            className={`block w-full rounded-md bg-white dark:bg-zinc-800/20 py-1.5 pr-12 pl-10 text-base text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm/6 ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              // Don't clear query on blur to show the search term
              if (!selectedAnimal) {
                setTimeout(() => setQuery(''), 100)
              }
            }}
            displayValue={displayValue}
            placeholder={disabled ? 'Select a customer first' : placeholder}
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
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800/20 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
          >
            {isLoading && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            )}
            
            {!isLoading && !ownerId && query.length > 0 && displayAnimals.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No animals found for &quot;{query}&quot;
              </div>
            )}

            {!isLoading && !ownerId && query.length > 0 && query.length < 2 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                Type at least 2 characters to search
              </div>
            )}

            {!isLoading && query.length === 0 && displayAnimals.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                {ownerId ? 'No animals found for this customer' : 'No animals found'}
              </div>
            )}

            {displayAnimals.map((animal) => (
              <ComboboxOption
                key={animal.id}
                value={animal}
                className="group cursor-default px-3 py-2 text-gray-900 dark:text-gray-100 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
              >
                <div className="flex items-center">
                  <HeartIcon className="size-5 text-gray-400 group-data-[focus]:text-white/80 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="block truncate font-medium group-data-[focus]:text-white">
                        {animal.name}
                      </span>
                      {animal.date_of_birth && (
                        <span className="ml-2 text-xs text-gray-500 group-data-[focus]:text-white/80">
                          {calculateAge(animal.date_of_birth)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 group-data-[focus]:text-white/80">
                      <span className="truncate">{animal.species}</span>
                      {animal.breed && (
                        <span className="truncate">{animal.breed}</span>
                      )}
                    </div>
                    {animal.owner && !ownerId && (
                      <div className="mt-1 text-xs text-gray-400 group-data-[focus]:text-white/60">
                        Owner: {animal.owner.first_name} {animal.owner.last_name}
                      </div>
                    )}
                    {!animal.owner && !ownerId && (
                      <div className="mt-1 text-xs text-gray-400 group-data-[focus]:text-white/60">
                        Owner info not available
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