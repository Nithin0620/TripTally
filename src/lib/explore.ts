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
  const hardcodedPlaces: ExploreFamousPlace[] = [
    // Taj Mahal Group
    { name: "Taj Mahal", description: "Iconic white marble mausoleum in Agra", coordinates: [78.0421, 27.1751], image: null },
    { name: "Agra Fort", description: "Historic red sandstone fort in Agra", coordinates: [78.0061, 27.1817], image: null },
    { name: "Mathura", description: "Sacred birthplace of Lord Krishna", coordinates: [77.6740, 27.4924], image: null },
    
    // Himalayas & North
    { name: "Shimla", description: "Hill station with colonial architecture", coordinates: [77.1734, 31.7744], image: null },
    { name: "Manali", description: "Adventure hub in Himachal Pradesh", coordinates: [77.1892, 32.2396], image: null },
    { name: "Kasol", description: "Scenic village in Parvati Valley", coordinates: [77.4126, 32.3617], image: null },
    { name: "Dharamshala", description: "Home of Dalai Lama and tea gardens", coordinates: [76.3237, 32.2190], image: null },
    { name: "Mussoorie", description: "Queen of hills with mall road", coordinates: [78.0599, 30.4615], image: null },
    { name: "Nainital", description: "Beautiful lake surrounded by forests", coordinates: [79.4504, 29.3919], image: null },
    { name: "Auli", description: "Skiing destination in Uttarakhand", coordinates: [79.5870, 30.0136], image: null },
    
    // Goa
    { name: "Goa", description: "Beach paradise with Portuguese heritage", coordinates: [73.8278, 15.2993], image: null },
    { name: "Panaji", description: "Capital of Goa with vibrant culture", coordinates: [73.8270, 15.4909], image: null },
    { name: "Palolem Beach", description: "Crescent-shaped beach in South Goa", coordinates: [73.7607, 14.6386], image: null },
    
    // Kerala & South
    { name: "Kochi", description: "Queen of Arabian Sea with backwaters", coordinates: [76.2673, 9.9312], image: null },
    { name: "Munnar", description: "Tea plantation hill station", coordinates: [77.0556, 10.5869], image: null },
    { name: "Alleppey", description: "Venice of the East with houseboats", coordinates: [76.3307, 9.4897], image: null },
    { name: "Thekkady", description: "Wildlife sanctuary and spice gardens", coordinates: [77.0595, 9.5181], image: null },
    { name: "Varkala", description: "Beach town with cliff views", coordinates: [76.7312, 8.7379], image: null },
    { name: "Ooty", description: "Green hill station in Tamil Nadu", coordinates: [76.6955, 11.4102], image: null },
    { name: "Kodaikanal", description: "Princess of hill stations", coordinates: [77.4891, 10.2381], image: null },
    
    // Rajasthan
    { name: "Jaipur", description: "Pink City with palaces and culture", coordinates: [75.7873, 26.9124], image: null },
    { name: "City Palace Jaipur", description: "Royal residence in pink city", coordinates: [75.8245, 26.9251], image: null },
    { name: "Jodhpur", description: "Blue City with majestic fort", coordinates: [73.1812, 26.2389], image: null },
    { name: "Udaipur", description: "City of Lakes with palaces", coordinates: [73.7125, 24.5854], image: null },
    { name: "Lake Palace Udaipur", description: "Floating palace in Lake Pichola", coordinates: [73.7267, 24.5872], image: null },
    { name: "Jaisalmer", description: "Golden Fort in desert", coordinates: [70.9154, 26.9124], image: null },
    { name: "Pushkar", description: "Sacred city with camel fair", coordinates: [74.5511, 26.4809], image: null },
    { name: "Ranakpur", description: "Marble temple with 1444 pillars", coordinates: [73.3311, 25.1086], image: null },
    { name: "Mount Abu", description: "Only hill station in Rajasthan", coordinates: [72.7136, 24.5920], image: null },
    
    // North India
    { name: "Delhi", description: "Capital with ancient and modern heritage", coordinates: [77.2090, 28.6139], image: null },
    { name: "Red Fort", description: "Historic Mughal fortress in Delhi", coordinates: [77.2410, 28.6562], image: null },
    { name: "India Gate", description: "Iconic war memorial in Delhi", coordinates: [77.2295, 28.6129], image: null },
    { name: "Varanasi", description: "Holiest city on Ganges river", coordinates: [82.9789, 25.3176], image: null },
    { name: "Jaipur City Palace", description: "Living palace and museum", coordinates: [75.8245, 26.9251], image: null },
    { name: "Haridwar", description: "Gateway to Gods on Ganges", coordinates: [78.1635, 29.9457], image: null },
    { name: "Lucknow", description: "City of Nawabs", coordinates: [80.9462, 26.8467], image: null },
    
    // Northeast India
    { name: "Assam Tea Gardens", description: "World-famous tea plantations", coordinates: [92.6022, 26.5923], image: null },
    { name: "Kaziranga", description: "UNESCO rhino sanctuary", coordinates: [93.5119, 26.5700], image: null },
    { name: "Meghalaya", description: "Land of clouds and monsoons", coordinates: [91.8960, 25.5788], image: null },
    { name: "Mawlynnong", description: "Asia's cleanest village", coordinates: [91.8746, 25.2754], image: null },
    { name: "Darjeeling", description: "Tea gardens in hills", coordinates: [88.2663, 27.0844], image: null },
    { name: "Shillong", description: "Scotland of the East", coordinates: [91.8769, 25.5788], image: null },
    
    // Center India
    { name: "Khajuraho Temples", description: "Ancient erotic temples", coordinates: [79.6299, 24.8318], image: null },
    { name: "Indore", description: "City of holkar dynasty", coordinates: [75.8577, 22.7196], image: null },
    { name: "Jabalpur", description: "Marble rocks in Narmada", coordinates: [79.5941, 23.1815], image: null },
    { name: "Mandu", description: "Afghan-style ruins", coordinates: [75.4092, 22.3548], image: null },
    { name: "Sanchi", description: "Ancient Buddhist stupa", coordinates: [77.7399, 23.4838], image: null },
    
    // Western India
    { name: "Mumbai", description: "Bollywood capital and financial hub", coordinates: [72.8479, 19.0760], image: null },
    { name: "Gateway of India", description: "Iconic monument in Mumbai", coordinates: [72.8343, 18.9598], image: null },
    { name: "Lonavala", description: "Hill station near Mumbai", coordinates: [73.4048, 18.7546], image: null },
    { name: "Khandala", description: "Scenic twin hill station", coordinates: [73.3326, 18.7137], image: null },
    { name: "Pune", description: "Cultural capital of Maharashtra", coordinates: [73.8567, 18.5204], image: null },
    { name: "Ahmedabad", description: "Industrial city with heritage", coordinates: [72.5379, 23.0225], image: null },
    { name: "Jambugaon", description: "Tribal village experiences", coordinates: [73.3690, 21.6667], image: null },
    
    // Beaches
    { name: "Havelock Island", description: "Tourist paradise in Andamans", coordinates: [93.3110, 12.0185], image: null },
    { name: "Neil Island", description: "Scenic island in Andamans", coordinates: [93.0394, 11.7269], image: null },
    { name: "Port Blair", description: "Capital of Andamans", coordinates: [92.7597, 11.7401], image: null },
    { name: "Rishikesh Beaches", description: "Ganges beach adventure hub", coordinates: [78.2676, 30.0889], image: null },
    { name: "Gokarna", description: "Hippie beach town", coordinates: [74.6529, 14.5519], image: null },
    { name: "Arambol Beach", description: "Peaceful Goan beach", coordinates: [73.6959, 15.6400], image: null },
    
    // Temples & Spiritual
    { name: "Meenakshi Temple", description: "Ancient temple in Madurai", coordinates: [78.1198, 9.9252], image: null },
    { name: "Rameshwaram", description: "Sacred pilgrimage site", coordinates: [79.2850, 8.7319], image: null },
    { name: "Tirupati Temple", description: "Richest temple in world", coordinates: [79.4192, 13.1827], image: null },
    { name: "Virupaksha Temple", description: "UNESCO temple in Hampi", coordinates: [76.4637, 15.3304], image: null },
    { name: "Badrinath", description: "Sacred temple in Himalayas", coordinates: [79.4982, 30.7474], image: null },
    { name: "Kedarnath", description: "Mountain temple on Ganges", coordinates: [79.0669, 30.2255], image: null },
    { name: "Somnath Temple", description: "Ancient temple in Gujarat", coordinates: [71.2115, 20.8789], image: null },
    
    // Forts & Palaces
    { name: "Mehrangarh Fort", description: "Massive fort in Jodhpur", coordinates: [73.1835, 26.2393], image: null },
    { name: "Gwalior Fort", description: "Grand fort in Gwalior", coordinates: [78.2087, 26.2181], image: null },
    { name: "Chittorgarh Fort", description: "Rajasthani royal fort", coordinates: [75.8296, 24.8740], image: null },
    { name: "Amber Fort", description: "Golden fort near Jaipur", coordinates: [75.8513, 26.9855], image: null },
    { name: "Ranthambore Fort", description: "Fort with tiger reserve", coordinates: [76.5033, 25.9394], image: null },
    { name: "Jaisalmer Fort", description: "Golden fort in desert", coordinates: [70.9154, 26.9124], image: null },
    
    // Adventure
    { name: "Ladakh", description: "High altitude desert region", coordinates: [77.3910, 34.1526], image: null },
    { name: "Leh", description: "Gateway to Ladakh", coordinates: [77.5941, 34.1734], image: null },
    { name: "Spiti Valley", description: "Hidden Buddhist valley", coordinates: [78.2439, 32.2218], image: null },
    { name: "Nubra Valley", description: "Desert valley in Ladakh", coordinates: [77.5881, 34.8145], image: null },
    { name: "Pangong Lake", description: "Glacial lake in Ladakh", coordinates: [78.7576, 33.7877], image: null },
    { name: "Tso Moriri", description: "Mountain lake in Ladakh", coordinates: [78.4517, 32.9744], image: null },
    
    // Wildlife
    { name: "Corbett National Park", description: "Tiger reserve in Himalayas", coordinates: [79.4082, 29.5920], image: null },
    { name: "Ranthambore", description: "Tiger sanctuary near Jaipur", coordinates: [76.5033, 25.9394], image: null },
    { name: "Kanha National Park", description: "Tiger and wildlife reserve", coordinates: [80.6030, 22.3775], image: null },
    { name: "Bandhavgarh", description: "Royal tiger reserve", coordinates: [81.5244, 23.6648], image: null },
    { name: "Sundarbans", description: "Bengal tiger sanctuary", coordinates: [89.1687, 21.9497], image: null },
    
    // Miscellaneous
    { name: "Mysore", description: "City of palaces", coordinates: [75.3704, 12.2958], image: null },
    { name: "Bangalore", description: "IT hub and garden city", coordinates: [77.5946, 12.9716], image: null },
    { name: "Hyderabad", description: "Modern city with old quarters", coordinates: [78.4744, 17.3850], image: null },
    { name: "Hampi", description: "UNESCO ruins of Vijayanagara", coordinates: [76.4637, 15.3304], image: null },
    { name: "Backwaters Kerala", description: "Network of canals and lakes", coordinates: [76.3469, 9.6000], image: null },
    { name: "Periyar Lake", description: "Artificial lake with animals", coordinates: [77.1881, 9.5500], image: null },
    { name: "Dudhsagar Falls", description: "Milky waterfall in Goa", coordinates: [73.9953, 15.2500], image: null },
    { name: "Jog Falls", description: "Highest waterfall in India", coordinates: [74.8249, 14.1719], image: null },
  ];

  return hardcodedPlaces;
}
