/**
 * Trip model - Represents a travel trip
 */
export interface Trip {
  id: string;           // UUID primary key
  title: string;        // Trip name
  description: string | null;  // Trip description
  start_date: string;   // Start date (YYYY-MM-DD format)
  end_date: string;     // End date (YYYY-MM-DD format)
  cover_image: string | null;  // Trip cover image URL
  created_by: string;   // UUID of trip creator (owner)
  created_at: string;   // ISO timestamp
}

/**
 * Trip with members included
 */
export interface TripWithMembers extends Trip {
  trip_members: TripMember[];
}

/**
 * Trip create input
 */
export interface CreateTripInput {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  created_by: string;
}

/**
 * Trip update input
 */
export interface UpdateTripInput {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  cover_image?: string;
}

/**
 * Trip member - User's role within a trip
 */
export interface TripMember {
  id: string;           // UUID primary key
  trip_id: string;      // UUID of the trip
  user_id: string;      // UUID of the user
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;    // ISO timestamp
}

/**
 * Add member to trip input
 */
export interface AddTripMemberInput {
  user_id: string;
  role?: 'owner' | 'editor' | 'viewer';
}

export const TRIP_TABLE = 'trips';
export const TRIP_MEMBERS_TABLE = 'trip_members';
// - cover_image: text (nullable)
// - budget_limit: numeric (nullable)
// - currency: text (default 'USD')
// - created_at: timestamp (auto)
// - updated_at: timestamp (auto)
