/**
 * Explore Service
 * Handles fetching and generating place data with caching
 */

import { Place } from "@/types";
import { getPlaceByName } from "@/lib/explore-db";

interface GeneratePlaceResponse {
  place: Place | null;
  cached: boolean;
  success: boolean;
  error?: string;
}

/**
 * Get place data - fetch from DB or generate if not found
 * @param placeName - Name of the place to fetch or generate
 * @returns Place data with cached status
 */
export async function getOrGeneratePlace(placeName: string): Promise<GeneratePlaceResponse> {
  try {
    // First try to fetch from database
    const existingPlace = await getPlaceByName(placeName);

    if (existingPlace) {
      return {
        place: existingPlace,
        cached: true,
        success: true,
      };
    }

    // If not found, generate from API
    const response = await fetch("/api/explore/generate-place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        placeName: placeName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        place: null,
        cached: false,
        success: false,
        error: errorData.error || "Failed to generate place data",
      };
    }

    const data = (await response.json()) as GeneratePlaceResponse;
    return data;
  } catch (error) {
    return {
      place: null,
      cached: false,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Convert place name to URL slug
 */
export function placeNameToSlug(placeName: string): string {
  return placeName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Convert URL slug back to place name
 */
export function slugToPlaceName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
