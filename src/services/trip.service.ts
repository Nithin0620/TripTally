// ============================================
// Trip Service
// ============================================

import { supabaseAdmin } from '@/lib/supabase';
import { CreateTripRequest, Trip, TripMember, User } from '@/types';

/**
 * Create a new trip
 */
export async function createTrip(
  userId: string,
  data: CreateTripRequest
): Promise<{ trip: Trip | null; error: string | null }> {
  try {
    // Create the trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .insert({
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        cover_image: data.cover_image,
        created_by: userId,
      })
      .select()
      .single();

    if (tripError || !trip) {
      return { trip: null, error: tripError?.message || 'Failed to create trip' };
    }

    // Add creator as owner
    const { error: memberError } = await supabaseAdmin
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) {
      return { trip: null, error: 'Failed to add creator as trip owner' };
    }

    return { trip, error: null };
  } catch (error) {
    console.error('Error creating trip:', error);
    return { trip: null, error: 'Internal server error' };
  }
}

/**
 * Get single trip with all data
 */
export async function getTrip(tripId: string) {
  try {
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return { trip: null, error: 'Trip not found' };
    }

    // Get trip members with user details
    const { data: members, error: membersError } = await supabaseAdmin
      .from('trip_members')
      .select('id, trip_id, user_id, role, joined_at, users(id, name, email, profile_image)')
      .eq('trip_id', tripId);

    if (membersError) {
      return { trip, members: [], error: null };
    }

    return { trip, members: members || [], error: null };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return { trip: null, members: [], error: 'Failed to fetch trip' };
  }
}

/**
 * Update trip
 */
export async function updateTrip(
  tripId: string,
  data: Partial<CreateTripRequest>
) {
  try {
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .update(data)
      .eq('id', tripId)
      .select()
      .single();

    if (error) {
      return { trip: null, error: error.message };
    }

    return { trip, error: null };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { trip: null, error: 'Failed to update trip' };
  }
}

/**
 * Delete trip
 */
export async function deleteTrip(tripId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return { error: 'Failed to delete trip' };
  }
}

/**
 * Add member to trip
 */
export async function addTripMember(
  tripId: string,
  userId: string,
  role: 'owner' | 'editor' | 'viewer'
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) {
      return { member: null, error: error.message };
    }

    return { member: data, error: null };
  } catch (error) {
    console.error('Error adding trip member:', error);
    return { member: null, error: 'Failed to add member' };
  }
}

/**
 * Remove member from trip
 */
export async function removeTripMember(tripId: string, userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('trip_members')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error removing trip member:', error);
    return { error: 'Failed to remove member' };
  }
}

/**
 * Update member role
 */
export async function updateTripMemberRole(
  tripId: string,
  userId: string,
  role: 'owner' | 'editor' | 'viewer'
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('trip_members')
      .update({ role })
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { member: null, error: error.message };
    }

    return { member: data, error: null };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { member: null, error: 'Failed to update member role' };
  }
}
