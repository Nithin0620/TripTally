/**
 * Activity model - Represents a single activity/event in a trip itinerary
 */
export interface Activity {
  id: string;                    // UUID primary key
  trip_id: string;               // UUID of the trip
  title: string;                 // Activity name
  activity_date: string;         // Activity date (YYYY-MM-DD)
  location: string | null;       // Physical location
  latitude: number | null;       // GPS latitude
  longitude: number | null;      // GPS longitude
  notes: string | null;          // Additional notes
  order_index: number | null;    // Order in itinerary
  created_at: string;            // ISO timestamp
}

/**
 * Activity create input
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

/**
 * Activity update input
 */
export interface UpdateActivityInput {
  title?: string;
  activity_date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
}

export const ACTIVITY_TABLE = 'activities';
