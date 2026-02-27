import { supabaseAdmin } from '../config/supabase';

/**
 * Service for activity-related database operations
 */

export interface CreateActivityInput {
  trip_id: string;
  title: string;
  activity_date: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
}

export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  activity_date: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  order_index: number | null;
  created_at: string;
}

/**
 * Create activity
 */
export const createActivity = async (input: CreateActivityInput): Promise<Activity> => {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .insert([input])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`);
  }

  return data;
};

/**
 * Get activity by ID
 */
export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }

  return data;
};

/**
 * Get all activities for a trip
 */
export const getTripActivities = async (tripId: string): Promise<Activity[]> => {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('trip_id', tripId)
    .order('activity_date', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return data || [];
};

/**
 * Update activity
 */
export const updateActivity = async (
  activityId: string,
  updates: Partial<Omit<Activity, 'id' | 'trip_id' | 'created_at'>>
): Promise<Activity> => {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update activity: ${error.message}`);
  }

  return data;
};

/**
 * Delete activity
 */
export const deleteActivity = async (activityId: string): Promise<void> => {
  const { error } = await supabaseAdmin.from('activities').delete().eq('id', activityId);

  if (error) {
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
};

/**
 * Reorder activities
 */
export const reorderActivities = async (activities: { id: string; order_index: number }[]) => {
  const { error } = await supabaseAdmin.from('activities').upsert(activities, {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(`Failed to reorder activities: ${error.message}`);
  }
};
