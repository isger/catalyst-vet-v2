'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import AnimalSearchModal from './AnimalSearchModal'

type AnimalSearchContextType = {
  openAnimalSearch: () => void
}

const AnimalSearchContext = createContext<AnimalSearchContextType | null>(null)

export function useAnimalSearch() {
  const context = useContext(AnimalSearchContext)
  if (!context) {
    throw new Error('useAnimalSearch must be used within AnimalSearchProvider')
  }
  return context
}

interface AnimalSearchProviderProps {
  children: ReactNode
}

export function AnimalSearchProvider({ children }: AnimalSearchProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openAnimalSearch = () => {
    setIsModalOpen(true)
  }

  const closeAnimalSearch = () => {
    setIsModalOpen(false)
  }

  return (
    <AnimalSearchContext.Provider value={{ openAnimalSearch }}>
      {children}
      <AnimalSearchModal open={isModalOpen} onClose={closeAnimalSearch} />
    </AnimalSearchContext.Provider>
  )
}