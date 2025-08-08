'use client'

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from '@headlessui/react'
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { HeartIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchAnimals, type AnimalSearchResult } from '@/server/queries/animal-search'

type Animal = AnimalSearchResult & {
  profileUrl: string
  imageUrl: string
  age: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
}

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface AnimalSearchModalProps {
  open: boolean
  onClose: () => void
}

export default function AnimalSearchModal({ open, onClose }: AnimalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Animal[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Helper function to calculate age from date of birth
  const calculateAge = useCallback((dateOfBirth: string | null): string => {
    if (!dateOfBirth) return 'Unknown'
    
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const ageInMs = now.getTime() - birth.getTime()
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365))
    
    if (ageInYears === 0) {
      const ageInMonths = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 30))
      return ageInMonths <= 1 ? '< 1 month' : `${ageInMonths} months`
    }
    
    return `${ageInYears} year${ageInYears === 1 ? '' : 's'}`
  }, [])

  // Transform database results to component format
  const transformAnimal = useCallback((animal: AnimalSearchResult): Animal => {
    const ownerName = animal.owner ? `${animal.owner.first_name} ${animal.owner.last_name}`.trim() : 'Unknown Owner'
    
    return {
      ...animal,
      profileUrl: `/animals/${animal.id}`,
      imageUrl: getAnimalImage(animal.species),
      age: calculateAge(animal.date_of_birth),
      ownerName,
      ownerPhone: animal.owner?.phone || '',
      ownerEmail: animal.owner?.email || '',
    }
  }, [calculateAge])

  // Get default image based on species
  const getAnimalImage = (species: string): string => {
    const speciesLower = species.toLowerCase()
    if (speciesLower.includes('dog')) {
      return 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('cat')) {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('bird')) {
      return 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('rabbit')) {
      return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
    return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }


  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchAnimals(query)
        setSearchResults(results.map(transformAnimal))
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, transformAnimal])

  const displayedAnimals = searchResults

  const handleAnimalSelect = (animal: Animal) => {
    router.push(animal.profileUrl)
    onClose()
    setQuery('')
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setSearchResults([])
    setIsSearching(false)
  }

  return (
    <Dialog
      className="relative z-10"
      open={open}
      onClose={handleClose}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-zinc-900 dark:divide-gray-800 dark:ring-white/10"
        >
          <Combobox
            onChange={(animal: Animal) => {
              if (animal) {
                handleAnimalSelect(animal)
              }
            }}
          >
            {({ activeOption }: { activeOption: Animal | null }) => (
              <div>
                <div className="grid grid-cols-1 border-b border-gray-100 dark:border-gray-800">
                  <ComboboxInput
                    autoFocus
                    className="col-start-1 row-start-1 h-12 w-full pr-4 pl-11 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm dark:text-gray-100 dark:bg-zinc-900"
                    placeholder="Search animals by name, species, breed, microchip ID, or owner..."
                    onChange={(event) => setQuery(event.target.value)}
                    onBlur={() => setQuery('')}
                  />
                  <MagnifyingGlassIcon
                    className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
                    aria-hidden="true"
                  />
                </div>

                {(query !== '' && (displayedAnimals.length > 0 || isSearching)) && (
                  <ComboboxOptions as="div" static hold className="flex transform-gpu divide-x divide-gray-100 dark:divide-gray-800">
                    <div
                      className={classNames(
                        'max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
                        activeOption ? 'sm:h-96' : undefined,
                      )}
                    >
                      <div className="-mx-2 text-sm text-gray-700 dark:text-gray-300">
                        {isSearching && (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                          </div>
                        )}
                        {!isSearching && displayedAnimals.map((animal) => (
                          <ComboboxOption
                            as="div"
                            key={animal.id}
                            value={animal}
                            className="group flex cursor-default items-center rounded-md p-2 select-none data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:data-focus:bg-zinc-700/30 dark:data-focus:text-gray-100"
                          >
                            <img src={animal.imageUrl} alt={`${animal.name} profile`} className="size-6 flex-none rounded-full" />
                            <div className="ml-3 flex-auto">
                              <div className="truncate font-medium">{animal.name}</div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {animal.species} • {animal.breed || 'Mixed'} • {animal.ownerName}
                              </div>
                            </div>
                            <ChevronRightIcon
                              className="ml-3 hidden size-5 flex-none text-gray-400 group-data-focus:block"
                              aria-hidden="true"
                            />
                          </ComboboxOption>
                        ))}
                      </div>
                    </div>

                    {activeOption && (
                      <div className="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex dark:divide-gray-800">
                        <div className="flex-none p-6 text-center">
                          <img src={activeOption.imageUrl} alt={`${activeOption.name} profile`} className="mx-auto size-16 rounded-full" />
                          <h2 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{activeOption.name}</h2>
                          <p className="text-sm/6 text-gray-500 dark:text-gray-400">{activeOption.species} • {activeOption.breed || 'Mixed'} • {activeOption.age}</p>
                        </div>
                        <div className="flex flex-auto flex-col justify-between p-6">
                          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <dt className="col-end-1 font-semibold text-gray-900 dark:text-gray-100">Owner</dt>
                            <dd>
                              <a href={`/customers/${activeOption.owner_id}`} className="text-indigo-600 underline dark:text-indigo-400">
                                {activeOption.ownerName}
                              </a>
                            </dd>
                            {activeOption.ownerPhone && (
                              <>
                                <dt className="col-end-1 font-semibold text-gray-900 dark:text-gray-100">Phone</dt>
                                <dd>{activeOption.ownerPhone}</dd>
                              </>
                            )}
                            {activeOption.microchip_id && (
                              <>
                                <dt className="col-end-1 font-semibold text-gray-900 dark:text-gray-100">Microchip ID</dt>
                                <dd className="font-mono text-xs">{activeOption.microchip_id}</dd>
                              </>
                            )}
                            {activeOption.additional_notes && (
                              <>
                                <dt className="col-end-1 font-semibold text-gray-900 dark:text-gray-100">Notes</dt>
                                <dd className="whitespace-pre-wrap">{activeOption.additional_notes}</dd>
                              </>
                            )}
                          </dl>
                          <button
                            type="button"
                            onClick={() => handleAnimalSelect(activeOption)}
                            className="mt-6 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            View Animal Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </ComboboxOptions>
                )}

                {query === '' && (
                  <div className="px-6 py-14 text-center text-sm sm:px-14">
                    <MagnifyingGlassIcon className="mx-auto size-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">Search for animals</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Start typing to search by name, species, breed, microchip ID, or owner.</p>
                  </div>
                )}

                {query !== '' && !isSearching && displayedAnimals.length === 0 && (
                  <div className="px-6 py-14 text-center text-sm sm:px-14">
                    <HeartIcon className="mx-auto size-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">No animals found</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">We couldn&apos;t find any animals with that term. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  )
}