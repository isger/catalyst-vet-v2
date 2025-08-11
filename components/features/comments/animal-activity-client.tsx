'use client'

import { useEffect, useState } from 'react'
import { AnimalCommentsSection } from './animal-comments-section'
import { addComment } from '@/server/actions/activity'
import { createClient } from '@/lib/supabase/client'

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

interface AnimalActivityClientProps {
  animalId: string
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInWeeks = Math.floor(diffInDays / 7)

  if (diffInMinutes < 1) {
    return 'now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function AnimalActivityClient({ animalId }: AnimalActivityClientProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setError('Please sign in to view activity feed')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, image')
          .eq('id', user.id)
          .single()

        setCurrentUser({
          id: user.id,
          name: profile?.name || user.email || 'Unknown User',
          imageUrl: profile?.image || undefined
        })

        // Get user's tenant membership
        const { data: membership } = await supabase
          .from('tenant_membership')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!membership) {
          setError('Access denied: Not a member of any practice')
          return
        }

        // Fetch activity logs
        const { data: activityLogs, error: activityError } = await supabase
          .from('activity_log')
          .select(`
            *,
            performed_by_profile:profiles!performed_by(name, image)
          `)
          .eq('record_id', animalId)
          .eq('record_type', 'animal')
          .eq('tenant_id', membership.tenant_id)
          .order('created_at', { ascending: false })

        if (activityError) {
          console.error('Error fetching activity logs:', activityError)
        }

        // Fetch activity comments
        const { data: activityComments, error: commentsError } = await supabase
          .from('activity_comment')
          .select(`
            *,
            posted_by_profile:profiles!posted_by(name, image)
          `)
          .eq('record_id', animalId)
          .eq('record_type', 'animal')
          .eq('tenant_id', membership.tenant_id)
          .order('created_at', { ascending: false })

        if (commentsError) {
          console.error('Error fetching activity comments:', commentsError)
        }

        // Combine and format the data
        const allItems: ActivityItem[] = []

        // Add activity logs
        if (activityLogs) {
          activityLogs.forEach(log => {
            allItems.push({
              id: log.id,
              type: log.action_type as 'created' | 'edited' | 'sent' | 'viewed' | 'paid',
              person: {
                name: log.performed_by_profile?.name || 'System',
                imageUrl: log.performed_by_profile?.image || undefined
              },
              date: formatRelativeDate(log.created_at),
              dateTime: log.created_at,
              changes: log.changes,
              action_description: log.action_description
            })
          })
        }

        // Add comments
        if (activityComments) {
          activityComments.forEach(comment => {
            allItems.push({
              id: comment.id,
              type: 'commented',
              comment: comment.comment,
              person: {
                name: comment.posted_by_profile?.name || 'Unknown User',
                imageUrl: comment.posted_by_profile?.image || undefined
              },
              date: formatRelativeDate(comment.created_at),
              dateTime: comment.created_at
            })
          })
        }

        // Sort all items by creation date (newest first)
        const sortedItems = allItems.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        setActivities(sortedItems)
        
      } catch (error) {
        console.error('Failed to load activity feed:', error)
        setError('Failed to load activity feed')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [animalId])

  const handleAddComment = async (content: string, mood?: string) => {
    if (!currentUser) return

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
    
    setActivities(prev => [optimisticComment, ...prev])

    try {
      const result = await addComment(animalId, 'animal', content, mood)
      
      if (result.success && result.comment) {
        // Replace optimistic comment with real one
        setActivities(prev => 
          prev.map(activity => 
            activity.id === optimisticComment.id ? result.comment! : activity
          )
        )
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
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        {error}
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        Please sign in to view activity feed
      </div>
    )
  }

  return (
    <AnimalCommentsSection
      activities={activities}
      currentUser={currentUser}
      onAddComment={handleAddComment}
    />
  )
}