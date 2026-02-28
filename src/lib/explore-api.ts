import { Place, GeneratePlacesResponse } from '@/types';

/**
 * Generate AI-powered travel destinations for a category
 *
 * @param category - The place category (Beaches, Mountains, Cities, Spiritual, Luxury)
 * @returns Promise<Place[]> - Array of generated Place objects
 * @throws Error if API call fails
 */
export async function generatePlacesByCategory(
  category: string
): Promise<Place[]> {
  try {
    const response = await fetch('/api/explore/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeneratePlacesResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate places');
    }

    return data.places;
  } catch (error) {
    console.error(`Error generating places for category ${category}:`, error);
    throw error;
  }
}

/**
 * Convert place name to URL slug
 *
 * @param name - Place name (e.g., "Goa")
 * @returns string - URL-friendly slug (e.g., "goa")
 */
export function placeNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Convert slug back to place name
 *
 * @param slug - URL slug (e.g., "goa")
 * @returns string - Place name (e.g., "Goa")
 */
export function slugToPlaceName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format budget string for display
 *
 * @param budget - Budget string (e.g., "₹1,000 - ₹3,000 per day")
 * @returns string - Formatted budget
 */
export function formatBudget(budget: string): string {
  return budget.trim();
}

/**
 * Format duration string for display
 *
 * @param duration - Duration string (e.g., "3-4 days")
 * @returns string - Formatted duration
 */
export function formatDuration(duration: string): string {
  return duration.trim();
}

/**
 * Format best time to visit string for display
 *
 * @param bestTime - Best time string (e.g., "November to February")
 * @returns string - Formatted best time
 */
export function formatBestTime(bestTime: string): string {
  return bestTime.trim();
}

/**
 * Fetch places data for a specific category
 * (Server-side helper - use in Server Components only)
 */
export async function fetchPlacesByCategory(
  category: string
): Promise<Place[]> {
  try {
    // This would typically call your database
    // For now, it's a placeholder for client code
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/explore/places?category=${encodeURIComponent(category)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch places: ${response.status}`);
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error(`Error fetching places for category ${category}:`, error);
    return [];
  }
}

/**
 * Validate if a string is a valid category
 *
 * @param category - String to validate
 * @returns boolean - True if valid category
 */
export function isValidCategory(
  category: unknown
): category is 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury' {
  const validCategories = ['Beaches', 'Mountains', 'Cities', 'Spiritual', 'Luxury'];
  return typeof category === 'string' && validCategories.includes(category);
}

/**
 * Get emoji for a category
 *
 * @param category - Place category
 * @returns string - Emoji representation
 */
export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Beaches: '🏖️',
    Mountains: '⛰️',
    Cities: '🏙️',
    Spiritual: '🙏',
    Luxury: '✨',
  };
  return emojis[category] || '📍';
}

/**
 * Get description for a category
 *
 * @param category - Place category
 * @returns string - Category description
 */
export function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    Beaches: 'Relax on pristine sands and explore coastal wonders',
    Mountains: 'Adventure awaits in majestic peaks and valleys',
    Cities: 'Experience vibrant urban culture and modern India',
    Spiritual: 'Find inner peace at sacred sites and spiritual centers',
    Luxury: 'Indulge in premium accommodations and world-class experiences',
  };
  return descriptions[category] || 'Explore amazing destinations';
}
