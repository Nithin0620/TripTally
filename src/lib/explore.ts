import { INDIA_CENTER } from "@/lib/mapbox";
import { getOpenAIJson } from "@/lib/openai";
import { getUnsplashImageForPlace, UnsplashImage } from "@/lib/unsplash";

type PlaceCoordinates = {
  latitude: number;
  longitude: number;
};

export type ExplorePlaceData = {
  placeName: string;
  displayName: string;
  overview: string;
  coordinates: PlaceCoordinates;
  avgBudgetINR: string;
  avgTimeRequired: string;
  mustVisitPlaces: string[];
  placesToStay: string[];
  restaurants: string[];
  image: UnsplashImage | null;
};

export type ExploreFamousPlace = {
  name: string;
  description: string;
  coordinates: [number, number];
  image: UnsplashImage | null;
};
export type ExploreCategory = {
  category: string;
  places: ExploreFamousPlace[];
};

export function placeNameToSlug(name: string) {
  return name
    .toLowerCase()
    .split(",")[0]
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type WikiSearchResult = {
  title: string;
};

type WikiSummaryResult = {
  extract?: string;
};

type OverpassElement = {
  tags?: {
    name?: string;
  };
};

export function slugToPlaceName(slug: string) {
  const decoded = decodeURIComponent(slug);
  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dedupeAndLimit(items: string[], limit = 8) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

function toFamousPlaceCoordinates(latitude: number, longitude: number): [number, number] {
  return [longitude, latitude];
}

async function fetchAIFamousPlacesByCategory(): Promise<ExploreCategory[] | null> {
  const aiResult = await getOpenAIJson<{
    categories: Array<{
      category: string;
      places: Array<{
        name: string;
        description: string;
        latitude: number;
        longitude: number;
      }>;
    }>;
  }>(
    "You are a travel planning assistant. Return ONLY valid JSON with realistic famous places in India grouped by category.",
    [
      "Generate categories of famous travel destinations in India.",
      "Each category should have 3 to 5 places.",
      "For each place provide: name, short description, latitude, longitude.",
      "JSON shape:",
      '{"categories":[{"category":"string","places":[{"name":"string","description":"string","latitude":0,"longitude":0}]}]}',
    ].join("\n")
  );

  if (!aiResult?.categories?.length) {
    return null;
  }

  const baseCategories = aiResult.categories
    .filter((category) => category.category && category.places?.length)
    .map((category) => ({
      category: category.category,
      places: category.places
        .filter((place) => place.name && typeof place.latitude === "number" && typeof place.longitude === "number")
        .map((place) => ({
          name: place.name,
          description: place.description || "Popular destination",
          coordinates: toFamousPlaceCoordinates(place.latitude, place.longitude),
        })),
    }))
    .filter((category) => category.places.length);

  const categoriesWithImages = await Promise.all(
    baseCategories.map(async (category) => {
      const placesWithImages = await Promise.all(
        category.places.map(async (place) => ({
          ...place,
          image: await getUnsplashImageForPlace(place.name),
        }))
      );

      return {
        category: category.category,
        places: placesWithImages,
      };
    })
  );

  return categoriesWithImages;
}

async function fetchAIPlaceInsights(placeName: string) {
  const aiResult = await getOpenAIJson<{
    avgBudgetINR: string;
    avgTimeRequired: string;
    mustVisitPlaces: string[];
  }>(
    "You are a travel planning assistant. Return ONLY valid JSON.",
    [
      `Provide travel insights for ${placeName}, India.`,
      "Include an average daily budget in INR as a range and average trip duration.",
      "Include 5 to 8 must-visit places in or near the destination.",
      "JSON shape:",
      '{"avgBudgetINR":"string","avgTimeRequired":"string","mustVisitPlaces":["string"]}',
    ].join("\n")
  );

  return {
    avgBudgetINR: aiResult?.avgBudgetINR || "Based on season and travel style",
    avgTimeRequired: aiResult?.avgTimeRequired || "Typically 2 to 5 days",
    mustVisitPlaces: dedupeAndLimit(aiResult?.mustVisitPlaces || [], 8),
  };
}

async function fetchGeocode(placeName: string): Promise<{ displayName: string; coordinates: PlaceCoordinates } | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(placeName + ", India")}`,
    {
      headers: {
        "User-Agent": "TripTally/1.0",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];
  if (!first) return null;

  return {
    displayName: first.display_name,
    coordinates: {
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
    },
  };
}

async function fetchWikiOverview(placeName: string) {
  const searchResponse = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      placeName + " India"
    )}&utf8=&format=json`,
    { cache: "no-store" }
  );

  if (!searchResponse.ok) {
    return "Discover local highlights, culture, and experiences for this destination.";
  }

  const searchData = (await searchResponse.json()) as {
    query?: {
      search?: WikiSearchResult[];
    };
  };

  const title = searchData.query?.search?.[0]?.title;
  if (!title) {
    return "Discover local highlights, culture, and experiences for this destination.";
  }

  const summaryResponse = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { cache: "no-store" }
  );

  if (!summaryResponse.ok) {
    return "Discover local highlights, culture, and experiences for this destination.";
  }

  const summaryData = (await summaryResponse.json()) as WikiSummaryResult;
  return summaryData.extract || "Discover local highlights, culture, and experiences for this destination.";
}

async function fetchOverpassNames(lat: number, lon: number, queryBody: string) {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: queryBody.replace(/\{\{LAT\}\}/g, String(lat)).replace(/\{\{LON\}\}/g, String(lon)),
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = (await response.json()) as {
    elements?: OverpassElement[];
  };

  return dedupeAndLimit((data.elements || []).map((element) => element.tags?.name || "").filter(Boolean));
}

export async function getExplorePlaceData(placename: string): Promise<ExplorePlaceData> {
  const placeName = slugToPlaceName(placename);

  const geocode = await fetchGeocode(placeName);
  const coordinates = geocode?.coordinates || {
    latitude: INDIA_CENTER[1],
    longitude: INDIA_CENTER[0],
  };

  const [overview, aiInsights, nearbyAttractions, hotels, restaurants, image] = await Promise.all([
    fetchWikiOverview(placeName),
    fetchAIPlaceInsights(placeName),
    fetchOverpassNames(
      coordinates.latitude,
      coordinates.longitude,
      `[out:json][timeout:25];
      (
        node(around:18000,{{LAT}},{{LON}})["tourism"~"attraction|museum|viewpoint"];
        way(around:18000,{{LAT}},{{LON}})["tourism"~"attraction|museum|viewpoint"];
      );
      out tags;`
    ),
    fetchOverpassNames(
      coordinates.latitude,
      coordinates.longitude,
      `[out:json][timeout:25];
      (
        node(around:16000,{{LAT}},{{LON}})["tourism"="hotel"];
        way(around:16000,{{LAT}},{{LON}})["tourism"="hotel"];
      );
      out tags;`
    ),
    fetchOverpassNames(
      coordinates.latitude,
      coordinates.longitude,
      `[out:json][timeout:25];
      (
        node(around:12000,{{LAT}},{{LON}})["amenity"="restaurant"];
        way(around:12000,{{LAT}},{{LON}})["amenity"="restaurant"];
      );
      out tags;`
    ),
    getUnsplashImageForPlace(placeName),
  ]);

  return {
    placeName,
    displayName: geocode?.displayName || `${placeName}, India`,
    overview,
    coordinates,
    avgBudgetINR: aiInsights.avgBudgetINR,
    avgTimeRequired: aiInsights.avgTimeRequired,
    mustVisitPlaces: nearbyAttractions.length ? nearbyAttractions : aiInsights.mustVisitPlaces,
    placesToStay: hotels.length ? hotels : ["Top-rated hotel", "Popular local stay", "Comfort budget stay"],
    restaurants: restaurants.length ? restaurants : ["Signature local restaurant", "Popular food street", "Highly rated cafe"],
    image,
  };
}

export async function getExploreCategories(): Promise<ExploreCategory[]> {
  const categories = await fetchAIFamousPlacesByCategory();

  if (categories?.length) {
    return categories;
  }

  return [];
}

export async function getFamousPlacesForMap(): Promise<ExploreFamousPlace[]> {
  const categories = await getExploreCategories();
  const allPlaces = categories.flatMap((category) => category.places);

  const seen = new Set<string>();
  const deduped: ExploreFamousPlace[] = [];

  for (const place of allPlaces) {
    const key = place.name.toLowerCase().trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(place);

    if (deduped.length >= 16) {
      break;
    }
  }

  return deduped;
}
