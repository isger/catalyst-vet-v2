import { getActivityFeed } from '@/server/queries/activity'
import { createClient } from '@/lib/supabase/server'
import { ActivityFeedClient } from './activity-feed-client'

interface AnimalActivityFeedProps {
  animalId: string
}

export async function AnimalActivityFeed({ animalId }: AnimalActivityFeedProps) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return <div>Please sign in to view activity feed</div>
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, image')
    .eq('id', user.id)
    .single()

  // Get user's tenant membership
  const { data: membership } = await supabase
    .from('tenant_membership')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    return <div>Access denied: Not a member of any practice</div>
  }

  try {
    const activities = await getActivityFeed(animalId, 'animal', membership.tenant_id)

    const currentUser = {
      id: user.id,
      name: profile?.name || user.email || 'Unknown User',
      imageUrl: profile?.image || undefined
    }

    // Transform activities to match the expected interface
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type === 'comment' ? 'commented' as const : 
            activity.action_type as 'created' | 'edited' | 'sent' | 'viewed' | 'paid' | 'commented',
      person: activity.person,
      comment: activity.comment,
      date: activity.date,
      dateTime: activity.dateTime,
      changes: activity.changes,
      action_description: activity.action_description
    }))

    return (
      <ActivityFeedClient
        activities={transformedActivities}
        currentUser={currentUser}
        recordId={animalId}
        recordType="animal"
      />
    )
  } catch (error) {
    console.error('Failed to load activity feed:', error)
    return <div>Failed to load activity feed</div>
  }
}