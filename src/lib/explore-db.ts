import { createClient } from '@supabase/supabase-js';
import { Place, ExploreCategory } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all places by category from Supabase
 */
export async function getPlacesByCategory(category: string): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Place[]) || [];
  } catch (error) {
    console.error(`Error fetching places for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch all categories with their places
 */
export async function getExploreCategories(): Promise<ExploreCategory[]> {
  const categories: ExploreCategory['category'][] = [
    'Beaches',
    'Mountains',
    'Cities',
    'Spiritual',
    'Luxury',
  ];

  const results: ExploreCategory[] = [];

  for (const category of categories) {
    const places = await getPlacesByCategory(category);
    results.push({
      category,
      places: places.slice(0, 4), // Show only first 4 places initially
    });
  }

  return results;
}

/**
 * Fetch a single place by name (slug)
 */
export async function getPlaceByName(name: string): Promise<Place | null> {
  try {
    // Convert slug back to place name (e.g., "goa" -> "Goa")
    const placeName = name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('name', placeName)
      .single();

    if (error) throw error;
    return (data as Place) || null;
  } catch (error) {
    console.error(`Error fetching place ${name}:`, error);
    return null;
  }
}

/**
 * Fetch multiple places by category (for "See More" functionality)
 */
export async function getMorePlacesByCategory(
  category: string,
  offset: number = 4
): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + 4);

    if (error) throw error;
    return (data as Place[]) || [];
  } catch (error) {
    console.error(`Error fetching more places for category ${category}:`, error);
    return [];
  }
}

/**
 * Search places by keyword
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .or(
        `name.ilike.%${query}%,state.ilike.%${query}%,description.ilike.%${query}%`
      );

    if (error) throw error;
    return (data as Place[]) || [];
  } catch (error) {
    console.error(`Error searching places with query "${query}":`, error);
    return [];
  }
}
