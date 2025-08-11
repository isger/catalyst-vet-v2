'use server'

import { revalidatePath } from 'next/cache'
import { addActivityComment } from '@/server/queries/activity'
import { createClient } from '@/lib/supabase/server'

export async function addComment(
  recordId: string,
  recordType: string,
  comment: string,
  mood?: string
) {
  const supabase = await createClient()
  
  // Get current user and tenant
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Get user's tenant membership to find tenant_id
  const { data: membership, error: membershipError } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (membershipError || !membership) {
    throw new Error('User is not a member of any tenant')
  }

  try {
    const newComment = await addActivityComment(
      recordId,
      recordType,
      comment,
      membership.tenant_id,
      user.id
    )

    // Revalidate the page to show the new comment
    revalidatePath(`/animals/${recordId}`)
    revalidatePath(`/customers/${recordId}`)

    return {
      success: true,
      comment: {
        id: newComment.id,
        type: 'commented' as const,
        person: {
          name: newComment.posted_by_profile?.name || 'Unknown User',
          imageUrl: newComment.posted_by_profile?.image || undefined,
        },
        comment: newComment.comment,
        date: 'now',
        dateTime: newComment.created_at,
      }
    }
  } catch (error) {
    console.error('Failed to add comment:', error)
    return {
      success: false,
      error: 'Failed to add comment'
    }
  }
}