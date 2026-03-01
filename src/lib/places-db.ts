import { supabaseAdmin } from '@/config/supabase';
import { Place } from '@/types';

/**
 * Fetch places from database by category with pagination
 * @param category - Place category (Beaches, Mountains, Cities, Spiritual, Luxury)
 * @param limit - Number of places to fetch
 * @param offset - Number of places to skip
 */
export async function getPlacesByCategory(
  category: string,
  limit: number = 4,
  offset: number = 0
): Promise<Place[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('places')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`[DB] Error fetching places for ${category}:`, error);
      return [];
    }

    return (data as Place[]) || [];
  } catch (error) {
    console.error(`[DB] Unexpected error fetching places:`, error);
    return [];
  }
}

/**
 * Search places by name or description (case-insensitive)
 * @param query - Search query string
 * @returns Matching places from database
 */
export async function searchPlacesByQuery(query: string): Promise<Place[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const searchTerm = query.toLowerCase().trim();

    // Search in name and description fields
    const { data, error } = await supabaseAdmin
      .from('places')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[DB] Error searching places:`, error);
      return [];
    }

    return (data as Place[]) || [];
  } catch (error) {
    console.error(`[DB] Unexpected error during search:`, error);
    return [];
  }
}

/**
 * Check if a place already exists in database by name (case-insensitive)
 * @param placeName - Name of the place to check
 * @returns Place object if exists, null otherwise
 */
export async function getPlaceByName(placeName: string): Promise<Place | null> {
  if (!placeName || placeName.trim().length === 0) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('places')
      .select('*')
      .ilike('name', placeName.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - this is expected
        return null;
      }
      console.error(`[DB] Error checking place existence:`, error);
      return null;
    }

    return (data as Place) || null;
  } catch (error) {
    console.error(`[DB] Unexpected error checking place:`, error);
    return null;
  }
}

/**
 * Save a newly generated place to the database
 * @param place - Place object to save
 * @returns Saved place with ID, or null on error
 */
export async function savePlaceToDB(place: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Promise<Place | null> {
  try {
    // Validate category
    const validCategories = ['Beaches', 'Mountains', 'Cities', 'Spiritual', 'Luxury'];
    if (!validCategories.includes(place.category)) {
      console.error(`[DB] Invalid category: ${place.category}`);
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('places')
      .insert([
        {
          ...place,
          gallery_images: place.gallery_images || [],
          hotels: place.hotels || [],
          restaurants: place.restaurants || [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(`[DB] Error saving place to database:`, error);
      return null;
    }

    console.log(`[DB] Successfully saved place: ${place.name}`);
    return (data as Place) || null;
  } catch (error) {
    console.error(`[DB] Unexpected error saving place:`, error);
    return null;
  }
}

/**
 * Get total count of places in a category
 * @param category - Place category
 * @returns Number of places
 */
export async function getPlacesCategoryCount(category: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);

    if (error) {
      console.error(`[DB] Error counting places:`, error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error(`[DB] Unexpected error counting places:`, error);
    return 0;
  }
}

/**
 * Get all categories with place counts
 * @returns Array of categories with their place counts
 */
export async function getAllCategoriesWithCounts(): Promise<
  Array<{ category: string; count: number }>
> {
  const categories = ['Beaches', 'Mountains', 'Cities', 'Spiritual', 'Luxury'];
  const results = [];

  for (const category of categories) {
    const count = await getPlacesCategoryCount(category);
    results.push({ category, count });
  }

  return results;
}
