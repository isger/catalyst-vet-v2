'use client'

import { useState } from 'react'
import { AnimalCommentsSection } from './animal-comments-section'

// Mock data matching the structure from your example
const initialActivity = [
  { 
    id: '1', 
    type: 'created' as const, 
    person: { name: 'Dr. Sarah Johnson' }, 
    date: '7d ago', 
    dateTime: '2024-01-10T10:32:00Z' 
  },
  { 
    id: '2', 
    type: 'edited' as const, 
    person: { name: 'Tech Martinez' }, 
    date: '6d ago', 
    dateTime: '2024-01-11T11:03:00Z' 
  },
  { 
    id: '3', 
    type: 'sent' as const, 
    person: { name: 'Dr. Sarah Johnson' }, 
    date: '6d ago', 
    dateTime: '2024-01-11T11:24:00Z' 
  },
  {
    id: '4',
    type: 'commented' as const,
    person: {
      name: 'Dr. Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=256&h=256&fit=crop&crop=face',
    },
    comment: 'Bella was very cooperative during her checkup today. No signs of anxiety or stress. Weight is stable and within normal range.',
    date: '3d ago',
    dateTime: '2024-01-14T15:56:00Z',
  },
  { 
    id: '5', 
    type: 'viewed' as const, 
    person: { name: 'Tech Martinez' }, 
    date: '2d ago', 
    dateTime: '2024-01-15T09:12:00Z' 
  },
  { 
    id: '6', 
    type: 'commented' as const, 
    person: { 
      name: 'Tech Martinez',
      imageUrl: undefined 
    }, 
    comment: 'Owner mentioned Bella has been eating well and is very active at home. Scheduled next vaccination for next month.',
    date: '1d ago', 
    dateTime: '2024-01-16T09:20:00Z' 
  },
]

const mockCurrentUser = {
  id: 'user-1',
  name: 'Dr. Sarah Johnson',
  imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=256&h=256&fit=crop&crop=face'
}

interface DemoAnimalCommentsProps {
  animalId: string
}

export function DemoAnimalComments({ animalId }: DemoAnimalCommentsProps) {
  const [activities, setActivities] = useState(initialActivity)

  const handleAddComment = async (content: string, mood?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newComment = {
      id: `comment-${Date.now()}`,
      type: 'commented' as const,
      person: {
        name: mockCurrentUser.name,
        imageUrl: mockCurrentUser.imageUrl,
      },
      comment: content,
      date: 'now',
      dateTime: new Date().toISOString(),
    }
    
    setActivities(prev => [...prev, newComment])
  }

  return (
    <AnimalCommentsSection
      activities={activities}
      currentUser={mockCurrentUser}
      onAddComment={handleAddComment}
    />
  )
}