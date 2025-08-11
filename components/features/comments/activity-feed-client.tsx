'use client'

import { useState, useTransition } from 'react'
import { AnimalCommentsSection } from './animal-comments-section'
import { addComment } from '@/server/actions/activity'
import { useRouter } from 'next/navigation'

interface FieldChange {
  from?: string | number | null
  to?: string | number | null
}

interface ActivityChanges {
  [fieldName: string]: FieldChange | string | number | null
}

interface ActivityItem {
  id: string
  type: 'created' | 'edited' | 'sent' | 'viewed' | 'paid' | 'commented'
  person: {
    name: string
    imageUrl?: string
  }
  comment?: string
  date: string
  dateTime: string
  changes?: ActivityChanges
  action_description?: string
}

interface User {
  id: string
  name: string
  imageUrl?: string
}

interface ActivityFeedClientProps {
  activities: ActivityItem[]
  currentUser: User
  recordId: string
  recordType: string
}

export function ActivityFeedClient({ 
  activities: initialActivities, 
  currentUser, 
  recordId, 
  recordType 
}: ActivityFeedClientProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleAddComment = async (content: string, mood?: string) => {
    // Optimistically add the comment
    const optimisticComment: ActivityItem = {
      id: `temp-${Date.now()}`,
      type: 'commented',
      person: {
        name: currentUser.name,
        imageUrl: currentUser.imageUrl,
      },
      comment: content,
      date: 'now',
      dateTime: new Date().toISOString(),
    }
    
    setActivities(prev => [...prev, optimisticComment])

    startTransition(async () => {
      try {
        const result = await addComment(recordId, recordType, content, mood)
        
        if (result.success && result.comment) {
          // Replace optimistic comment with real one
          setActivities(prev => 
            prev.map(activity => 
              activity.id === optimisticComment.id ? result.comment! : activity
            )
          )
          router.refresh() // Refresh to get any server-side updates
        } else {
          // Remove optimistic comment on failure
          setActivities(prev => prev.filter(activity => activity.id !== optimisticComment.id))
          throw new Error(result.error || 'Failed to add comment')
        }
      } catch (error) {
        // Remove optimistic comment on error
        setActivities(prev => prev.filter(activity => activity.id !== optimisticComment.id))
        console.error('Failed to add comment:', error)
        throw error
      }
    })
  }

  return (
    <AnimalCommentsSection
      activities={activities}
      currentUser={currentUser}
      onAddComment={handleAddComment}
    />
  )
}