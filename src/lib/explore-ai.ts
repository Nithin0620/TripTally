/**
 * AI Place Generation Service
 * Handles generating new places using LLM (Groq/OpenAI)
 * Uses structured JSON output for consistency
 */

import { Place } from '@/types';

interface GeneratedPlaceData {
  name: string;
  description: string;
  category: 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury';
  state: string;
  best_time_to_visit: string;
  avg_budget: string;
  travel_duration: string;
  hotels: Array<{
    name: string;
    description: string;
    price_range: string;
  }>;
  restaurants: Array<{
    name: string;
    description: string;
    cuisine: string;
  }>;
}

type PlaceCategory = 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury';

/**
 * Generate place data using AI/LLM
 * IMPORTANT: Only call this after confirming NO matches exist in database
 *
 * @param searchQuery - User's search query or category
 * @param category - Optional category to bias generation
 * @returns Generated place data or null on error
 */
export async function generatePlaceWithAI(
  searchQuery: string,
  category?: string
): Promise<GeneratedPlaceData | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[AI] GROQ_API_KEY not configured');
    return null;
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Create focused prompt for single place
  const prompt = `Generate detailed travel destination information for: "${searchQuery}"
  
Required JSON structure:
{
  "name": "exact destination name",
  "description": "200-250 word detailed description highlighting unique features, attractions, and what makes it special",
  "state": "Indian state or location",
  "category": "${category || 'Cities'}" (must be one of: Beaches, Mountains, Cities, Spiritual, Luxury),
  "best_time_to_visit": "best months to visit with brief explanation",
  "avg_budget": "estimated daily budget range (e.g., ₹2,000 - ₹5,000 per day)",
  "travel_duration": "recommended trip duration (e.g., 3-4 days)",
  "hotels": [
    {
      "name": "specific hotel name",
      "description": "one line description",
      "price_range": "price range (e.g., ₹3,000 - ₹8,000 per night)"
    }
  ],
  "restaurants": [
    {
      "name": "specific restaurant name",
      "description": "one line description",
      "cuisine": "cuisine type"
    }
  ]
}

Requirements:
- Generate for India only
- Descriptions must be 200-250 words minimum
- Be specific and detailed
- Use realistic budget estimates
- Include 3 hotels and 3 restaurants
- Valid JSON only, no markdown formatting`;

  try {
    console.log(`[AI] Generating place for: ${searchQuery}`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3, // Lower temp for more consistent output
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content:
              'You are a travel expert for Indian destinations. Respond ONLY with valid JSON, no additional text or markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Generation API error (${response.status}):`, errorText);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[AI] No content in response');
      return null;
    }

    try {
      const jsonText = extractJsonObject(content);
      const parsed = JSON.parse(jsonText) as GeneratedPlaceData;

      // Validate required fields
      if (!parsed.name || !parsed.description || !parsed.state) {
        console.error('[AI] Missing required fields in generated data', parsed);
        return null;
      }

      console.log(`[AI] Successfully generated place: ${parsed.name}`);
      return parsed;
    } catch (parseError) {
      console.error('[AI] Failed to parse generated JSON:', parseError, 'Content:', content);
      return null;
    }
  } catch (error) {
    console.error('[AI] Unexpected error during generation:', error);
    return null;
  }
}

/**
 * Transform generated place data to database Place format
 */
export function transformGeneratedPlaceToDBFormat(
  generated: GeneratedPlaceData
): Omit<Place, 'id' | 'created_at' | 'updated_at'> {
  const category = inferCategory(generated.name, generated.description, generated.category);

  return {
    name: generated.name,
    category,
    state: generated.state,
    description: generated.description,
    best_time_to_visit: generated.best_time_to_visit,
    avg_budget: generated.avg_budget,
    travel_duration: generated.travel_duration,
    hero_image: '', // Will be populated from Unsplash or similar on frontend
    gallery_images: [],
    hotels: generated.hotels.map((h) => ({
      name: h.name,
      description: h.description,
      price_range: h.price_range,
      image: '', // Will be populated from Unsplash
    })),
    restaurants: generated.restaurants.map((r) => ({
      name: r.name,
      description: r.description,
      cuisine: r.cuisine,
      image: '', // Will be populated from Unsplash
    })),
  };
}

function inferCategory(name: string, description: string, fallback: string): PlaceCategory {
  const content = `${name} ${description}`.toLowerCase();

  const categoryKeywords: Record<PlaceCategory, string[]> = {
    Beaches: ['beach', 'coast', 'coastal', 'shore', 'island', 'sea', 'ocean'],
    Mountains: ['mountain', 'hill', 'himalaya', 'valley', 'trek', 'peak'],
    Cities: ['city', 'metro', 'urban', 'capital', 'market', 'downtown'],
    Spiritual: ['temple', 'spiritual', 'pilgrim', 'ashram', 'monastery', 'sacred'],
    Luxury: ['luxury', 'premium', 'resort', 'exclusive', 'five-star', 'opulent'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords) as Array<[
    PlaceCategory,
    string[],
  ]>) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      return category;
    }
  }

  const normalizedFallback = normalizeCategory(fallback);
  return normalizedFallback || 'Cities';
}

function normalizeCategory(rawCategory: string): PlaceCategory | null {
  const value = rawCategory.toLowerCase().trim();

  if (value.includes('beach')) return 'Beaches';
  if (value.includes('mountain') || value.includes('hill')) return 'Mountains';
  if (value.includes('spiritual') || value.includes('temple')) return 'Spiritual';
  if (value.includes('luxury') || value.includes('premium')) return 'Luxury';
  if (value.includes('city') || value.includes('urban')) return 'Cities';

  return null;
}

/**
 * Extract JSON object from text response
 * Handles code fence markers and plain JSON
 */
function extractJsonObject(text: string): string {
  const trimmed = text.trim();

  // Already valid JSON object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  // Fenced JSON (```json ... ```)
  const fencedMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  // Extract first { to last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}
