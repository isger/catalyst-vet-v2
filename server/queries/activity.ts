import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'

export type ActivityLogWithUser = Tables<'activity_log'> & {
  performed_by_profile: {
    name: string | null
    image: string | null
  } | null
}

export type ActivityCommentWithUser = Tables<'activity_comment'> & {
  posted_by_profile: {
    name: string | null
    image: string | null
  } | null
}

export type ActivityFeedItem = {
  id: string
  type: 'activity' | 'comment'
  action_type?: string
  action_description?: string
  comment?: string
  person: {
    name: string
    imageUrl?: string
  }
  date: string
  dateTime: string
  changes?: any
}

export async function getActivityFeed(
  recordId: string, 
  recordType: string,
  tenantId: string
): Promise<ActivityFeedItem[]> {
  const supabase = await createClient()
  
  // Fetch activity logs
  const { data: activityLogs, error: activityError } = await supabase
    .from('activity_log')
    .select(`
      *,
      performed_by_profile:profiles!performed_by(name, image)
    `)
    .eq('record_id', recordId)
    .eq('record_type', recordType)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (activityError) {
    console.error('Error fetching activity logs:', activityError)
    throw activityError
  }

  // Fetch activity comments
  const { data: activityComments, error: commentsError } = await supabase
    .from('activity_comment')
    .select(`
      *,
      posted_by_profile:profiles!posted_by(name, image)
    `)
    .eq('record_id', recordId)
    .eq('record_type', recordType)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Error fetching activity comments:', commentsError)
    throw commentsError
  }

  // Combine and format the data
  const allItems: ActivityFeedItem[] = []

  // Add activity logs
  if (activityLogs) {
    activityLogs.forEach(log => {
      allItems.push({
        id: log.id,
        type: 'activity',
        action_type: log.action_type,
        action_description: log.action_description,
        person: {
          name: log.performed_by_profile?.name || 'System',
          imageUrl: log.performed_by_profile?.image || undefined
        },
        date: formatRelativeDate(log.created_at),
        dateTime: log.created_at,
        changes: log.changes
      })
    })
  }

  // Add comments
  if (activityComments) {
    activityComments.forEach(comment => {
      allItems.push({
        id: comment.id,
        type: 'comment',
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
  return allItems.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
}

export async function addActivityComment(
  recordId: string,
  recordType: string,
  comment: string,
  tenantId: string,
  userId: string
): Promise<ActivityCommentWithUser> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity_comment')
    .insert({
      record_id: recordId,
      record_type: recordType,
      comment,
      tenant_id: tenantId,
      posted_by: userId
    })
    .select(`
      *,
      posted_by_profile:profiles!posted_by(name, image)
    `)
    .single()

  if (error) {
    console.error('Error adding activity comment:', error)
    throw error
  }

  return data
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