'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { Link } from '@/components/ui/link'
import { ChevronRightIcon } from '@heroicons/react/16/solid'
import { addComment } from '@/server/actions/activity'
import type { Json } from '@/types/supabase'

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
  changes?: Json
  action_description?: string
}

interface User {
  id: string
  name: string
  imageUrl?: string
}

interface AnimalActivitySummaryProps {
  animalId: string
  maxItems?: number
}

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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


function formatFieldChanges(changes: Json | undefined, action_description?: string): string {
  // If no changes, return fallback
  if (!changes) {
    return action_description || 'updated the record'
  }

  // Field name mapping
  const fieldLabels: Record<string, string> = {
    name: 'name',
    species: 'species', 
    breed: 'breed',
    color: 'color',
    gender: 'gender',
    date_of_birth: 'date of birth',
    weight_kg: 'weight',
    microchip_id: 'microchip ID',
    insurance_provider: 'insurance provider',
    insurance_policy_number: 'insurance policy number',
    behavioral_notes: 'behavioral notes',
    dietary_requirements: 'dietary requirements',
    allergies: 'allergies',
    medical_conditions: 'medical conditions',
    medications: 'medications'
  }

  // Handle the exact format: {"color":{"new":"Yellow","old":"Tortoiseshell"}}
  if (changes && typeof changes === 'object' && !Array.isArray(changes)) {
    const fieldKeys = Object.keys(changes)
    
    if (fieldKeys.length === 1) {
      const fieldName = fieldKeys[0]
      const fieldData = changes[fieldName]
      const fieldLabel = fieldLabels[fieldName] || fieldName.replace(/_/g, ' ')
      
      // Check for old/new format
      if (fieldData && typeof fieldData === 'object' && 'old' in fieldData && 'new' in fieldData) {
        const oldValue = fieldData.old || 'empty'
        const newValue = fieldData.new || 'empty'
        return `changed ${fieldLabel} from "${oldValue}" to "${newValue}"`
      }
      
      // Check for from/to format  
      if (fieldData && typeof fieldData === 'object' && 'from' in fieldData && 'to' in fieldData) {
        const fromValue = fieldData.from || 'empty'
        const toValue = fieldData.to || 'empty'
        return `changed ${fieldLabel} from "${fromValue}" to "${toValue}"`
      }
      
      // Simple value change
      return `updated ${fieldLabel} to "${fieldData}"`
    }
    
    // Multiple fields
    if (fieldKeys.length > 1) {
      const fieldNames = fieldKeys.map(key => fieldLabels[key] || key.replace(/_/g, ' '))
      return `updated ${fieldNames.join(', ')}`
    }
  }

  // Fallback
  return action_description || 'updated the record'
}

export function AnimalActivitySummary({ animalId, maxItems = 3 }: AnimalActivitySummaryProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setError('Please sign in to view activity')
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
          imageUrl: user.user_metadata?.avatar_url || profile?.image || undefined
        })

        // Get user's tenant membership
        const { data: membership } = await supabase
          .from('tenant_membership')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!membership) {
          setError('Access denied')
          return
        }

        // Fetch limited activity logs
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
          .limit(maxItems)

        if (activityError) {
          console.error('Error fetching activity logs:', activityError)
        }

        // Fetch limited activity comments
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
          .limit(maxItems)

        if (commentsError) {
          console.error('Error fetching activity comments:', commentsError)
        }

        // Get total count for "show more" link
        const [{ count: activityCount }, { count: commentsCount }] = await Promise.all([
          supabase
            .from('activity_log')
            .select('*', { count: 'exact', head: true })
            .eq('record_id', animalId)
            .eq('record_type', 'animal')
            .eq('tenant_id', membership.tenant_id),
          supabase
            .from('activity_comment')
            .select('*', { count: 'exact', head: true })
            .eq('record_id', animalId)
            .eq('record_type', 'animal')
            .eq('tenant_id', membership.tenant_id)
        ])

        setTotalCount((activityCount || 0) + (commentsCount || 0))

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

        // Sort all items by creation date (newest first) and limit to maxItems
        const sortedItems = allItems
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
          .slice(0, maxItems)
        
        setActivities(sortedItems)
        
      } catch (error) {
        console.error('Failed to load activity summary:', error)
        setError('Failed to load activity')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [animalId, maxItems])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim() || isSubmitting || !currentUser) return

    setIsSubmitting(true)
    
    // Optimistically add the comment
    const optimisticComment: ActivityItem = {
      id: `temp-${Date.now()}`,
      type: 'commented',
      person: {
        name: currentUser.name,
        imageUrl: currentUser.imageUrl,
      },
      comment: comment.trim(),
      date: 'now',
      dateTime: new Date().toISOString(),
    }
    
    setActivities(prev => [optimisticComment, ...prev.slice(0, maxItems - 1)])

    try {
      const result = await addComment(animalId, 'animal', comment.trim())
      
      if (result.success && result.comment) {
        // Replace optimistic comment with real one
        setActivities(prev => 
          prev.map(activity => 
            activity.id === optimisticComment.id ? result.comment! : activity
          )
        )
        setComment('')
        setTotalCount(prev => prev + 1)
      } else {
        // Remove optimistic comment on failure
        setActivities(prev => prev.filter(activity => activity.id !== optimisticComment.id))
        throw new Error(result.error || 'Failed to add comment')
      }
    } catch (error) {
      // Remove optimistic comment on error
      setActivities(prev => prev.filter(activity => activity.id !== optimisticComment.id))
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
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
      <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
        {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <>
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          <p className="text-sm">No recent activity</p>
          <Link 
            href={`/animals/${animalId}?tab=activity`}
            className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 mt-2 inline-flex items-center gap-1"
          >
            View full activity history
            <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {/* Comment form */}
        {currentUser && (
          <div className="mt-4 flex gap-x-3">
            {currentUser.imageUrl ? (
              <Image
                alt=""
                src={currentUser.imageUrl}
                width={20}
                height={20}
                className="size-5 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
              />
            ) : (
              <div className="size-5 flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {getUserInitials(currentUser.name)}
                </span>
              </div>
            )}
            <form onSubmit={handleAddComment} className="relative flex-auto">
              <div className="overflow-hidden rounded-lg pb-8 shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-indigo-600">
                <textarea
                  rows={2}
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full resize-none bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pr-2">
                <button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <ul role="list" className="space-y-4">
        {activities.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-3">
            <div
              className={classNames(
                activityItemIdx === activities.length - 1 ? 'h-6' : '-bottom-6',
                'absolute top-0 left-0 flex w-6 justify-center',
              )}
            >
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
            </div>
            {activityItem.type === 'commented' ? (
              <>
                {activityItem.person.imageUrl ? (
                  <Image
                    alt=""
                    src={activityItem.person.imageUrl}
                    width={20}
                    height={20}
                    className="relative mt-2 size-5 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                  />
                ) : (
                  <div className="relative mt-2 size-5 flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {getUserInitials(activityItem.person.name)}
                    </span>
                  </div>
                )}
                <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 dark:ring-gray-700 ring-inset bg-white dark:bg-gray-800">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span> commented
                    </div>
                    <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {activityItem.date}
                    </time>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">{activityItem.comment}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex size-5 flex-none items-center justify-center bg-white dark:bg-gray-900 mt-2">
                  {activityItem.type === 'paid' ? (
                    <CheckCircleIcon aria-hidden="true" className="size-5 text-indigo-600" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-600" />
                  )}
                </div>
                <div className="flex-auto py-0.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span>{' '}
                    {(() => {
                      const activityText = activityItem.type === 'edited' ?
                        formatFieldChanges(activityItem.changes, activityItem.action_description) :
                        formatFieldChanges(activityItem.changes, activityItem.action_description)
                      
                      // Truncate if longer than 180 characters
                      return activityText.length > 180 
                        ? `${activityText.substring(0, 180)}...`
                        : activityText
                    })()}.
                  </p>
                  <time dateTime={activityItem.dateTime} className="text-xs text-gray-500 dark:text-gray-400">
                    {activityItem.date}
                  </time>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Comment form */}
      {currentUser && (
        <div className="mt-4 flex gap-x-3">
          {currentUser.imageUrl ? (
            <Image
              alt=""
              src={currentUser.imageUrl}
              width={20}
              height={20}
              className="size-5 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
            />
          ) : (
            <div className="size-5 flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {getUserInitials(currentUser.name)}
              </span>
            </div>
          )}
          <form onSubmit={handleAddComment} className="relative flex-auto">
            <div className="overflow-hidden rounded-lg pb-8 shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-indigo-600">
              <textarea
                rows={2}
                placeholder="Add your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                className="block w-full resize-none bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pr-2">
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Link to full activity */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href={`/animals/${animalId}?tab=activity`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1"
        >
          View all activity & comments ({totalCount})
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}