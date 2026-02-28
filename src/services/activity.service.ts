// ============================================
// Activity Service
// ============================================

import { supabase } from '@/lib/supabase';
import { CreateActivityRequest, Activity } from '@/types';

/**
 * Create an activity
 */
export async function createActivity(
  data: CreateActivityRequest
): Promise<{ activity: Activity | null; error: string | null }> {
  try {
    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        trip_id: data.trip_id,
        title: data.title,
        activity_date: data.activity_date,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        order_index: data.order_index,
      })
      .select()
      .single();

    if (error) {
      return { activity: null, error: error.message };
    }

    return { activity, error: null };
  } catch (error) {
    console.error('Error creating activity:', error);
    return { activity: null, error: 'Internal server error' };
  }
}

/**
 * Get activity
 */
export async function getActivity(activityId: string) {
  try {
    const { data: activity, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) {
      return { activity: null, error: 'Activity not found' };
    }

    return { activity, error: null };
  } catch (error) {
    console.error('Error fetching activity:', error);
    return { activity: null, error: 'Failed to fetch activity' };
  }
}

/**
 * Get all activities for a trip
 */
export async function getTripActivities(tripId: string) {
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('trip_id', tripId)
      .order('activity_date', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      return { activities: [], error: error.message };
    }

    return { activities: activities || [], error: null };
  } catch (error) {
    console.error('Error fetching trip activities:', error);
    return { activities: [], error: 'Failed to fetch activities' };
  }
}

/**
 * Update activity
 */
export async function updateActivity(
  activityId: string,
  data: Partial<CreateActivityRequest>
) {
  try {
    const { data: activity, error } = await supabase
      .from('activities')
      .update({
        title: data.title,
        activity_date: data.activity_date,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        order_index: data.order_index,
      })
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      return { activity: null, error: error.message };
    }

    return { activity, error: null };
  } catch (error) {
    console.error('Error updating activity:', error);
    return { activity: null, error: 'Failed to update activity' };
  }
}

/**
 * Delete activity
 */
export async function deleteActivity(activityId: string) {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return { error: 'Failed to delete activity' };
  }
}

/**
 * Reorder activities
 */
export async function reorderActivities(
  activities: Array<{ id: string; order_index: number }>
) {
  try {
    // Use Promise.all to update all activities
    const updates = activities.map(({ id, order_index }) =>
      supabase
        .from('activities')
        .update({ order_index })
        .eq('id', id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some(result => result.error);
    if (hasError) {
      return { error: 'Failed to reorder some activities' };
    }

    return { error: null };
  } catch (error) {
    console.error('Error reordering activities:', error);
    return { error: 'Failed to reorder activities' };
  }
}
