import { supabaseAdmin } from '../config/supabase';

/**
 * Service for trip-related database operations
 */

export interface CreateTripInput {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  created_by: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  created_by: string;
  created_at: string;
}

export interface TripWithMembers extends Trip {
  trip_members: Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
  }>;
}

/**
 * Create a new trip
 */
export const createTrip = async (input: CreateTripInput): Promise<Trip> => {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .insert([input])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  return data;
};

/**
 * Get trip by ID
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  return data;
};

/**
 * Get trip with members
 */
export const getTripWithMembers = async (tripId: string): Promise<TripWithMembers | null> => {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .select('*, trip_members(*)')
    .eq('id', tripId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  return data;
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  const { data, error } = await supabaseAdmin
    .from('trip_members')
    .select('trip_id, trips(*)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch user trips: ${error.message}`);
  }

  return data?.map((item: any) => item.trips) || [];
};

/**
 * Update trip
 */
export const updateTrip = async (
  tripId: string,
  updates: Partial<Omit<Trip, 'id' | 'created_by' | 'created_at'>>
): Promise<Trip> => {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  return data;
};

/**
 * Delete trip
 */
export const deleteTrip = async (tripId: string): Promise<void> => {
  const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId);

  if (error) {
    throw new Error(`Failed to delete trip: ${error.message}`);
  }
};

/**
 * Add member to trip
 */
export const addTripMember = async (
  tripId: string,
  userId: string,
  role: 'owner' | 'editor' | 'viewer' = 'editor'
) => {
  const { data, error } = await supabaseAdmin
    .from('trip_members')
    .insert([{ trip_id: tripId, user_id: userId, role }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add trip member: ${error.message}`);
  }

  return data;
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  tripId: string,
  userId: string,
  role: 'owner' | 'editor' | 'viewer'
) => {
  const { data, error } = await supabaseAdmin
    .from('trip_members')
    .update({ role })
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }

  return data;
};

/**
 * Remove member from trip
 */
export const removeTripMember = async (tripId: string, userId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to remove trip member: ${error.message}`);
  }
};

/**
 * Get trip members
 */
export const getTripMembers = async (tripId: string) => {
  const { data, error } = await supabaseAdmin
    .from('trip_members')
    .select('*, users(*)')
    .eq('trip_id', tripId);

  if (error) {
    throw new Error(`Failed to fetch trip members: ${error.message}`);
  }

  return data || [];
};
